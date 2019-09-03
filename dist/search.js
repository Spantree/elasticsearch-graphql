"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var nexus_1 = require("nexus");
var _ = __importStar(require("lodash"));
var elasticsearch_1 = require("@elastic/elasticsearch");
var graphql_parse_resolve_info_1 = require("graphql-parse-resolve-info");
var types_1 = require("./generated/nexus/types");
var keyword_1 = require("./keyword");
var numeric_1 = require("./numeric");
var core_1 = require("nexus/dist/core");
require("dotenv").config();
exports.esClient = new elasticsearch_1.Client({
    node: process.env.ES_PATH
});
exports.createFilterInput = function (typeName, keywordFields, numericFields) {
    return nexus_1.inputObjectType({
        name: typeName + "FilterInput",
        definition: function (t) {
            keywordFields.map(function (fieldName) {
                return t.field(fieldName, { type: types_1.KeywordFilterInput });
            });
            numericFields.map(function (fieldName) {
                return t.field(fieldName, { type: types_1.NumericFilterInput });
            });
        }
    });
};
exports.buildHitsQuery = function (filters, queryFields) {
    var size = _.get(queryFields, "hits.args.size", 10);
    var from = _.get(queryFields, "hits.args.from", 0);
    return {
        size: size,
        from: from,
        query: {
            bool: {
                must: _.flatten(Object.values(filters))
            }
        }
    };
};
exports.buildFilters = function (args, keywordFields, numericFields) {
    var allFields = _.uniq(__spreadArrays(Object.keys(keywordFields), Object.keys(numericFields)));
    // console.debug("allFields", allFields);
    // fill each with an empty array
    var filters = {};
    allFields.forEach(function (k) { return (filters[k] = []); });
    var argFilters = args.filters || {};
    Object.keys(keywordFields).forEach(function (field) {
        var _a;
        var filterArgs = argFilters[field];
        var fieldPath = keywordFields[field];
        if (filterArgs) {
            if (filterArgs.terms) {
                filters[field].push({
                    terms: (_a = {},
                        _a[fieldPath] = filterArgs.terms,
                        _a)
                });
            }
        }
    }, {});
    Object.keys(numericFields).forEach(function (field) {
        var _a;
        var filterArgs = argFilters[field] || {};
        var fieldPath = numericFields[field];
        var specifiedRangeKeys = _.intersection(Object.keys(filterArgs), [
            "gte",
            "gt",
            "lte",
            "lt"
        ]);
        // console.log("specifiedRangeKeys", specifiedRangeKeys);
        if (specifiedRangeKeys.length > 0) {
            //   console.log("build numeric filters");
            filters[field].push({
                range: (_a = {},
                    _a[fieldPath] = specifiedRangeKeys.reduce(function (obj, k) {
                        obj[k] = filterArgs[k];
                        return obj;
                    }, {}),
                    _a)
            });
        }
    });
    return filters;
};
exports.handleQueryError = function (description, query) { return function (error) {
    console.error("Error occurred performing " + description + " query: " + JSON.stringify(query, null, 2), error);
}; };
exports.buildAggsQuery = function (queryFields, filters, fieldConfig, aggType) {
    var aggFields = _.get(queryFields, "aggs.fieldsByTypeName." + aggType.name);
    var activeAggs = aggFields ? Object.keys(aggFields) : [];
    var query = {
        size: 0,
        aggs: __assign(__assign({}, keyword_1.buildKeywordAggs(activeAggs, aggFields, filters, fieldConfig.keywords)), numeric_1.buildNumericAggs(activeAggs, aggFields, filters, fieldConfig.numerics))
    };
    //   console.debug("aggsQuery", query);
    return query;
};
exports.buildSearchTypes = function (typeName, fieldConfig) {
    var keywordFields = Object.keys(fieldConfig.keywords);
    var numericFields = Object.keys(fieldConfig.numerics);
    var filterInput = exports.createFilterInput(typeName, keywordFields, numericFields);
    var hit = nexus_1.objectType({
        name: typeName + "Hit",
        definition: function (t) {
            t.float("score");
            t.field("doc", {
                type: typeName
            });
        }
    });
    var aggregations = nexus_1.objectType({
        name: typeName + "SearchResultAggregations",
        definition: function (t) {
            keywordFields.map(function (fieldName) {
                return t.field(fieldName, {
                    type: "KeywordAggregationsOutput",
                    nullable: true,
                    args: {
                        filterSelf: core_1.booleanArg({ required: false })
                    }
                });
            });
            numericFields.map(function (fieldName) {
                return t.field(fieldName, {
                    type: "NumericAggregationsOutput",
                    nullable: true,
                    args: {
                        filterSelf: core_1.booleanArg({ required: false })
                    }
                });
            });
        }
    });
    var result = nexus_1.objectType({
        name: typeName + "SearchResults",
        definition: function (t) {
            t.field("metrics", { type: types_1.SearchMetrics });
            t.field("hits", {
                type: hit,
                args: {
                    size: core_1.intArg({ nullable: true }),
                    from: core_1.intArg({ nullable: true })
                },
                list: true
            });
            t.field("aggs", {
                type: aggregations
            });
        }
    });
    return {
        filterInput: filterInput,
        hit: hit,
        aggregations: aggregations,
        result: result
    };
};
exports.resolveSearchQuery = function (root, args, context, info, fieldConfig, indexName, resultType, aggType) { return __awaiter(void 0, void 0, void 0, function () {
    var queryFields, filters, hitsQuery, hitsResp, aggsQuery, aggsResp, hits, aggs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queryFields = _.get(graphql_parse_resolve_info_1.parseResolveInfo(info), "fieldsByTypeName." + resultType.name);
                filters = exports.buildFilters(args, fieldConfig.keywords, fieldConfig.numerics);
                hitsQuery = exports.buildHitsQuery(filters, queryFields);
                console.log("hitsQuery", JSON.stringify(hitsQuery, null, 2));
                return [4 /*yield*/, exports.esClient
                        .search({ index: indexName, body: hitsQuery })
                        .then(function (r) { return r.body; })
                        .catch(exports.handleQueryError("hits query", hitsQuery))];
            case 1:
                hitsResp = _a.sent();
                aggsQuery = exports.buildAggsQuery(queryFields, filters, fieldConfig, aggType);
                console.log("aggsQuery", JSON.stringify(aggsQuery, null, 2));
                return [4 /*yield*/, exports.esClient
                        .search({
                        index: indexName,
                        body: aggsQuery
                    })
                        .then(function (r) { return r.body; })
                        .catch(exports.handleQueryError("aggs query", aggsQuery))];
            case 2:
                aggsResp = _a.sent();
                hits = hitsResp.hits.hits.map(function (h) {
                    return {
                        score: h._score,
                        doc: h._source
                    };
                });
                aggs = Object.keys(aggsResp.aggregations || []).reduce(function (obj, field) {
                    var output = {};
                    // console.log("aggs", aggsResp.aggregations);
                    var aggValue = aggsResp.aggregations[field];
                    if (aggValue.cardinality) {
                        output["cardinality"] = aggValue.cardinality.value;
                    }
                    if (aggValue.terms) {
                        console.log("aggValue", aggValue);
                        output["terms"] = aggValue.terms.buckets.map(function (b) {
                            return {
                                key: b.key,
                                docCount: b.doc_count
                            };
                        });
                    }
                    output["stats"] = aggValue.stats;
                    if (aggValue.extendedStats) {
                        output["extendedStats"] = _.mapKeys(aggValue.extendedStats, function (value, key) { return _.camelCase(key); });
                    }
                    if (aggValue.histogram) {
                        var buckets = aggValue.histogram.buckets;
                        output["histogram"] = aggValue.histogram.buckets.map(function (b) {
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
                return [2 /*return*/, {
                        metrics: {
                            totalHits: hitsResp.hits.total,
                            hitsQueryTookMs: hitsResp.took,
                            aggsQueryTookMs: aggsResp.took
                        },
                        hits: hits,
                        aggs: aggs
                    }];
        }
    });
}); };
//# sourceMappingURL=search.js.map