"use strict";
// Generated Nexus Code from Provided SDL
Object.defineProperty(exports, "__esModule", { value: true });
var nexus_1 = require("nexus");
exports.ExtendedStatsAggregationOutput = nexus_1.objectType({
    name: "ExtendedStatsAggregationOutput",
    definition: function (t) {
        t.int("count");
        t.float("min");
        t.float("max");
        t.float("avg");
        t.float("sum");
        t.float("sumOfSquares");
        t.float("variance");
        t.float("stdDeviation");
        t.field("stdDeviationBounds", { type: exports.StandardDeviationBounds });
    }
});
exports.KeywordAggregationsOutput = nexus_1.objectType({
    name: "KeywordAggregationsOutput",
    definition: function (t) {
        t.int("cardinality", { nullable: true });
        t.list.field("terms", { type: exports.TermAggregationBucket });
    }
});
exports.NumericAggregationsOutput = nexus_1.objectType({
    name: "NumericAggregationsOutput",
    definition: function (t) {
        t.field("stats", {
            type: exports.StatsAggregationOutput,
            nullable: true,
        });
        t.field("extendedStats", {
            type: exports.ExtendedStatsAggregationOutput,
            nullable: true,
        });
        t.list.field("histogram", {
            type: exports.NumericHistogramBucket,
            args: {
                interval: nexus_1.floatArg(),
            },
        });
    }
});
exports.NumericHistogramBucket = nexus_1.objectType({
    name: "NumericHistogramBucket",
    definition: function (t) {
        t.float("gte");
        t.float("lt", { nullable: true });
        t.float("key");
        t.float("docCount");
    }
});
exports.SearchMetrics = nexus_1.objectType({
    name: "SearchMetrics",
    definition: function (t) {
        t.int("totalHits");
        t.int("hitsQueryTookMillis", { nullable: true });
        t.int("boundsQueryTookMillis", { nullable: true });
        t.int("aggsQueryTookMillis", { nullable: true });
    }
});
exports.StandardDeviationBounds = nexus_1.objectType({
    name: "StandardDeviationBounds",
    definition: function (t) {
        t.float("upper");
        t.float("lower");
    }
});
exports.StatsAggregationOutput = nexus_1.objectType({
    name: "StatsAggregationOutput",
    definition: function (t) {
        t.int("count");
        t.float("min");
        t.float("max");
        t.float("avg");
        t.float("sum");
    }
});
exports.TermAggregationBucket = nexus_1.objectType({
    name: "TermAggregationBucket",
    definition: function (t) {
        t.string("key", { nullable: true });
        t.int("docCount", { nullable: true });
    }
});
exports.KeywordFilterInput = nexus_1.inputObjectType({
    name: "KeywordFilterInput",
    definition: function (t) {
        t.list.string("terms", { required: true });
    }
});
exports.NumericFilterInput = nexus_1.inputObjectType({
    name: "NumericFilterInput",
    definition: function (t) {
        t.float("gte", { required: true });
        t.float("gt", { required: true });
        t.float("lte", { required: true });
        t.float("lt", { required: true });
    }
});
//# sourceMappingURL=types.js.map