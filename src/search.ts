import { objectType, inputObjectType } from "nexus";
import * as _ from "lodash";

import { Client as ElasticClient } from "@elastic/elasticsearch";
import { parseResolveInfo } from "graphql-parse-resolve-info";

import {
  KeywordFilterInput,
  NumericFilterInput,
  SearchMetrics
} from "../generated/nexus/types";

import { buildKeywordAggs } from "./keyword";

import { buildNumericAggs } from "./numeric";
import {
  NexusObjectTypeDef,
  booleanArg,
  intArg,
  NexusInputObjectTypeDef,
  GetGen
} from "nexus/dist/core";

require("dotenv").config();

export const esClient = new ElasticClient({
  node: process.env.ES_PATH
});

export const createFilterInput = (
  typeName: string,
  keywordFields,
  numericFields: any
) => {
  return inputObjectType({
    name: `${typeName}FilterInput`,
    definition(t) {
      keywordFields.map(fieldName =>
        t.field(fieldName, { type: KeywordFilterInput })
      );
      numericFields.map(fieldName =>
        t.field(fieldName, { type: NumericFilterInput })
      );
    }
  });
};

export const buildHitsQuery = (filters: any, queryFields: any) => {
  const size = _.get(queryFields, "hits.args.size", 10);
  const from = _.get(queryFields, "hits.args.from", 0);

  return {
    size,
    from,
    query: {
      bool: {
        must: _.flatten(Object.values(filters))
      }
    }
  };
};

export const buildFilters = (
  args: any,
  keywordFields: any,
  numericFields: any
) => {
  const allFields = _.uniq([
    ...Object.keys(keywordFields),
    ...Object.keys(numericFields)
  ]);

  // console.debug("allFields", allFields);

  // fill each with an empty array
  const filters = {};
  allFields.forEach(k => (filters[k] = []));

  const argFilters: any = args.filters || {};
  Object.keys(keywordFields).forEach(field => {
    const filterArgs = argFilters[field];
    const fieldPath = keywordFields[field];
    if (filterArgs) {
      if (filterArgs.terms) {
        filters[field].push({
          terms: {
            [fieldPath]: filterArgs.terms
          }
        });
      }
    }
  }, {});

  Object.keys(numericFields).forEach(field => {
    const filterArgs = argFilters[field] || {};
    const fieldPath = numericFields[field];
    const specifiedRangeKeys = _.intersection(Object.keys(filterArgs), [
      "gte",
      "gt",
      "lte",
      "lt"
    ]);
    // console.log("specifiedRangeKeys", specifiedRangeKeys);
    if (specifiedRangeKeys.length > 0) {
      //   console.log("build numeric filters");
      filters[field].push({
        range: {
          [fieldPath]: specifiedRangeKeys.reduce((obj, k) => {
            obj[k] = filterArgs[k];
            return obj;
          }, {})
        }
      });
    }
  });
  return filters;
};

export const handleQueryError = (description: string, query: any) => (
  error: Error
) => {
  console.error(
    `Error occurred performing ${description} query: ${JSON.stringify(
      query,
      null,
      2
    )}`,
    error
  );
};

export const buildAggsQuery = (
  queryFields: any,
  filters: {},
  fieldConfig,
  aggType: NexusObjectTypeDef<string>
) => {
  const aggFields = _.get(queryFields, `aggs.fieldsByTypeName.${aggType.name}`);

  const activeAggs = aggFields ? Object.keys(aggFields) : [];

  const query = {
    size: 0,
    aggs: {
      ...buildKeywordAggs(activeAggs, aggFields, filters, fieldConfig.keywords),
      ...buildNumericAggs(activeAggs, aggFields, filters, fieldConfig.numerics)
    }
  };

  //   console.debug("aggsQuery", query);

  return query;
};

interface SearchTypes {
  filterInput: NexusInputObjectTypeDef<string>;
  hit: NexusObjectTypeDef<string>;
  aggregations: NexusObjectTypeDef<string>;
  result: NexusObjectTypeDef<string>;
}

export const buildSearchTypes = (
  typeName: GetGen<"allOutputTypes", string>,
  fieldConfig
): SearchTypes => {
  const keywordFields = Object.keys(fieldConfig.keywords);
  const numericFields = Object.keys(fieldConfig.numerics);

  const filterInput = createFilterInput(typeName, keywordFields, numericFields);

  const hit = objectType({
    name: `${typeName}Hit`,
    definition(t) {
      t.float("score");
      t.field("doc", {
        type: typeName
      });
    }
  });

  const aggregations = objectType({
    name: `${typeName}SearchResultAggregations`,
    definition(t) {
      keywordFields.map(fieldName =>
        t.field(fieldName, {
          type: "KeywordAggregationsOutput",
          nullable: true,
          args: {
            filterSelf: booleanArg({ required: false })
          }
        })
      );
      numericFields.map(fieldName =>
        t.field(fieldName, {
          type: "NumericAggregationsOutput",
          nullable: true,
          args: {
            filterSelf: booleanArg({ required: false })
          }
        })
      );
    }
  });

  const result = objectType({
    name: `${typeName}SearchResults`,
    definition(t) {
      t.field("metrics", { type: SearchMetrics });
      t.field("hits", {
        type: hit,
        args: {
          size: intArg({ nullable: true }),
          from: intArg({ nullable: true })
        },
        list: true
      });
      t.field("aggs", {
        type: aggregations
      });
    }
  });

  return {
    filterInput,
    hit,
    aggregations,
    result
  };
};

export const resolveSearchQuery = async (
  root,
  args,
  context,
  info,
  fieldConfig,
  indexName: string,
  resultType: NexusObjectTypeDef<string>,
  aggType: NexusObjectTypeDef<string>
) => {
  // const parsedInfo = parseResolveInfo(info);
  const queryFields = _.get(
    parseResolveInfo(info),
    `fieldsByTypeName.${resultType.name}`
  );

  // console.log("buildFilters");
  const filters = buildFilters(
    args,
    fieldConfig.keywords,
    fieldConfig.numerics
  );
  // console.log("buildHitsQuery");
  const hitsQuery = buildHitsQuery(filters, queryFields);

  console.log("hitsQuery", JSON.stringify(hitsQuery, null, 2));

  const hitsResp = await esClient
    .search({ index: indexName, body: hitsQuery })
    .then(r => r.body)
    .catch(handleQueryError("hits query", hitsQuery));

  const aggsQuery = buildAggsQuery(queryFields, filters, fieldConfig, aggType);

  console.log("aggsQuery", JSON.stringify(aggsQuery, null, 2));

  const aggsResp = await esClient
    .search({
      index: indexName,
      body: aggsQuery
    })
    .then(r => r.body)
    .catch(handleQueryError("aggs query", aggsQuery));

  // console.log("mapping hits");
  const hits = hitsResp.hits.hits.map(h => {
    return {
      score: h._score,
      doc: h._source
    };
  });

  // console.log("Processing aggregations");
  const aggs = Object.keys(aggsResp.aggregations || []).reduce((obj, field) => {
    const output = {};
    // console.log("aggs", aggsResp.aggregations);
    const aggValue = aggsResp.aggregations[field];

    if (aggValue.cardinality) {
      output["cardinality"] = aggValue.cardinality.value;
    }
    if (aggValue.terms) {
      console.log("aggValue", aggValue);
      output["terms"] = aggValue.terms.buckets.map(b => {
        return {
          key: b.key,
          docCount: b.doc_count
        };
      });
    }

    output["stats"] = aggValue.stats;

    if (aggValue.extendedStats) {
      output["extendedStats"] = _.mapKeys(
        aggValue.extendedStats,
        (value, key) => _.camelCase(key)
      );
    }
    if (aggValue.histogram) {
      const buckets = aggValue.histogram.buckets;
      output["histogram"] = aggValue.histogram.buckets.map(b => {
        return {
          key: b.key,
          gte: b.key,
          docCount: b.doc_count
        };
      });
    }
    obj[field] = output;
    return obj;
  }, {});

  return {
    metrics: {
      totalHits: hitsResp.hits.total,
      hitsQueryTookMs: hitsResp.took,
      aggsQueryTookMs: aggsResp.took
    },
    hits,
    aggs
  };
};
