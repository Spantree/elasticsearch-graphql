import { Client as ElasticClient } from "@elastic/elasticsearch";
import { NexusObjectTypeDef, NexusInputObjectTypeDef } from "nexus/dist/core";
export declare const esClient: ElasticClient;
export declare const createFilterInput: (typeName: string, keywordFields: any, numericFields: any) => NexusInputObjectTypeDef<string>;
export declare const buildHitsQuery: (filters: any, queryFields: any) => {
    size: any;
    from: any;
    query: {
        bool: {
            must: unknown[];
        };
    };
};
export declare const buildFilters: (args: any, keywordFields: any, numericFields: any) => {};
export declare const handleQueryError: (description: string, query: any) => (error: Error) => void;
export declare const buildAggsQuery: (queryFields: any, filters: {}, fieldConfig: any, aggType: NexusObjectTypeDef<string>) => {
    size: number;
    aggs: {};
};
interface SearchTypes {
    filterInput: NexusInputObjectTypeDef<string>;
    hit: NexusObjectTypeDef<string>;
    aggregations: NexusObjectTypeDef<string>;
    result: NexusObjectTypeDef<string>;
}
export declare const buildSearchTypes: (typeName: string, fieldConfig: any) => SearchTypes;
export declare const resolveSearchQuery: (root: any, args: any, context: any, info: any, fieldConfig: any, indexName: string, resultType: NexusObjectTypeDef<string>, aggType: NexusObjectTypeDef<string>) => Promise<{
    metrics: {
        totalHits: any;
        hitsQueryTookMs: any;
        aggsQueryTookMs: any;
    };
    hits: any;
    aggs: {};
}>;
export {};
