import { NumericAggregationsOutput } from './generated/nexus/types'
import * as _ from 'lodash'

export const buildNumericAggs = (
  activeAggs: string[],
  aggFields: any,
  filters: {},
  numericFields: any,
) => {
  const fieldNames = Object.keys(numericFields)
  const activeNumericAggs = _.intersection(fieldNames, activeAggs) || []

  //   console.log("buildNumericAggs");
  return activeNumericAggs.reduce((obj, fieldName) => {
    const filterSelf = _.get(aggFields, `${fieldName}.args.filterSelf`, true)
    const fieldArgs = _.get(
      aggFields,
      `${fieldName}.fieldsByTypeName.${NumericAggregationsOutput.name}`,
    )
    const fieldPath = numericFields[fieldName]
    obj[fieldName] = {
      filter: {
        bool: {
          must: _.flatten(
            _.filter<string>(Object.keys(filters), k => {
              return filterSelf || k !== fieldName
            }).map(k => filters[k]),
          ),
        },
      },
      aggs: {
        histogram: {
          histogram: {
            field: fieldPath,
            interval: _.get(fieldArgs, 'histogram.args.interval', 50),
          },
        },
        stats: {
          stats: {
            field: fieldPath,
          },
        },
        extendedStats: {
          extended_stats: {
            field: fieldPath,
          },
        },
      },
    }
    return obj
  }, {})
}
