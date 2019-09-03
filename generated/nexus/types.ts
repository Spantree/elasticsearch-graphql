// Generated code

import { objectType, floatArg, inputObjectType, scalarType } from 'nexus';

export const ExtendedStatsAggregationOutput = objectType({
  name: "ExtendedStatsAggregationOutput",
  definition(t) {
    t.int("count")
    t.float("min")
    t.float("max")
    t.float("avg")
    t.float("sum")
    t.float("sumOfSquares")
    t.float("variance")
    t.float("stdDeviation")
    t.field("stdDeviationBounds", { type: StandardDeviationBounds })
  }
})
export const KeywordAggregationsOutput = objectType({
  name: "KeywordAggregationsOutput",
  definition(t) {
    t.int("cardinality", { nullable: true })
    t.list.field("terms", { type: TermAggregationBucket })
  }
})
export const NumericAggregationsOutput = objectType({
  name: "NumericAggregationsOutput",
  definition(t) {
    t.field("stats", {
      type: StatsAggregationOutput,
      nullable: true,
    })
    t.field("extendedStats", {
      type: ExtendedStatsAggregationOutput,
      nullable: true,
    })
    t.list.field("histogram", {
      type: NumericHistogramBucket,
      args: {
        interval: floatArg(),
      },
    })
  }
})
export const NumericHistogramBucket = objectType({
  name: "NumericHistogramBucket",
  definition(t) {
    t.float("gte")
    t.float("lt", { nullable: true })
    t.float("key")
    t.float("docCount")
  }
})
export const SearchMetrics = objectType({
  name: "SearchMetrics",
  definition(t) {
    t.int("totalHits")
    t.int("hitsQueryTookMillis", { nullable: true })
    t.int("boundsQueryTookMillis", { nullable: true })
    t.int("aggsQueryTookMillis", { nullable: true })
  }
})
export const StandardDeviationBounds = objectType({
  name: "StandardDeviationBounds",
  definition(t) {
    t.float("upper")
    t.float("lower")
  }
})
export const StatsAggregationOutput = objectType({
  name: "StatsAggregationOutput",
  definition(t) {
    t.int("count")
    t.float("min")
    t.float("max")
    t.float("avg")
    t.float("sum")
  }
})
export const TermAggregationBucket = objectType({
  name: "TermAggregationBucket",
  definition(t) {
    t.string("key", { nullable: true })
    t.int("docCount", { nullable: true })
  }
})

export const KeywordFilterInput = inputObjectType({
  name: "KeywordFilterInput",
  definition(t) {
    t.list.string("terms", { required: true })
  }
});
export const NumericFilterInput = inputObjectType({
  name: "NumericFilterInput",
  definition(t) {
    t.float("gte", { required: true })
    t.float("gt", { required: true })
    t.float("lte", { required: true })
    t.float("lt", { required: true })
  }
});