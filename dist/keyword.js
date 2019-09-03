"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
exports.buildKeywordAggs = function (activeAggs, aggFields, filters, keywordFields) {
    var activeKeywordAggs = _.intersection(Object.keys(keywordFields), activeAggs) || [];
    return activeKeywordAggs.reduce(function (obj, fieldName) {
        var fieldPath = keywordFields[fieldName];
        // console.log("keywordFields", keywordFields);
        var filterSelf = _.get(aggFields, fieldName + ".args.filterSelf", true);
        obj[fieldName] = {
            filter: {
                bool: {
                    must: _.flatten(_.filter(Object.keys(filters), function (k) {
                        return filterSelf || k != fieldName;
                    }).map(function (k) { return filters[k]; }))
                }
            },
            aggs: {
                terms: {
                    terms: {
                        field: fieldPath
                    }
                },
                cardinality: {
                    cardinality: {
                        field: fieldPath
                    }
                }
            }
        };
        return obj;
    }, {});
};
//# sourceMappingURL=keyword.js.map