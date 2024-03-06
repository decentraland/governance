import { validateQuarter, validateYear } from '../helpers'

import useURLSearchParams from './useURLSearchParams'

function useYearAndQuarterParams() {
  const params = useURLSearchParams()
  const yearParam = params.get('year')
  const quarterParam = params.get('quarter')
  const year = validateYear(yearParam)
  const quarter = validateQuarter(quarterParam)
  const areValidParams = year !== null && quarter !== null

  return {
    year,
    quarter,
    areValidParams,
  }
}

export default useYearAndQuarterParams
