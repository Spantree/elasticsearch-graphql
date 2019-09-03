"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./generated/nexus/types");
var _ = __importStar(require("lodash"));
exports.buildNumericAggs = function (activeAggs, aggFields, filters, numericFields) {
    var fieldNames = Object.keys(numericFields);
    var activeNumericAggs = _.intersection(fieldNames, activeAggs) || [];
    //   console.log("buildNumericAggs");
    return activeNumericAggs.reduce(function (obj, fieldName) {
        var filterSelf = _.get(aggFields, fieldName + ".args.filterSelf", true);
        var fieldArgs = _.get(aggFields, fieldName + ".fieldsByTypeName." + types_1.NumericAggregationsOutput.name);
        var fieldPath = numericFields[fieldName];
        obj[fieldName] = {
            filter: {
                bool: {
                    must: _.flatten(_.filter(Object.keys(filters), function (k) {
                        return filterSelf || k != fieldName;
                    }).map(function (k) { return filters[k]; }))
                }
            },
            aggs: {
                histogram: {
                    histogram: {
                        field: fieldPath,
                        interval: _.get(fieldArgs, "histogram.args.interval", 50)
                    }
                },
                stats: {
                    stats: {
                        field: fieldPath
                    }
                },
                extendedStats: {
                    extended_stats: {
                        field: fieldPath
                    }
                }
            }
        };
        return obj;
    }, {});
};
//# sourceMappingURL=numeric.js.map