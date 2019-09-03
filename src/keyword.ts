import * as _ from 'lodash'

export const buildKeywordAggs = (
  activeAggs: string[],
  aggFields: any,
  filters: {},
  keywordFields: any,
) => {
  const activeKeywordAggs =
    _.intersection(Object.keys(keywordFields), activeAggs) || []
  return activeKeywordAggs.reduce((obj, fieldName) => {
    const fieldPath = keywordFields[fieldName]
    // console.log("keywordFields", keywordFields);
    const filterSelf = _.get(aggFields, `${fieldName}.args.filterSelf`, true)
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
        terms: {
          terms: {
            field: fieldPath,
          },
        },
        cardinality: {
          cardinality: {
            field: fieldPath,
          },
        },
      },
    }

    return obj
  }, {})
}
