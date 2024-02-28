import { useMemo } from 'react'

import { useLocation } from '@reach/router'

import { validateQuarter, validateYear } from '../helpers'

function useYearAndQuarterParams() {
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const yearParam = params.get('year')
  const quarterParam = params.get('quarter')
  const year = validateYear(yearParam)
  const quarter = validateQuarter(quarterParam)

  return {
    year,
    quarter,
  }
}

export default useYearAndQuarterParams
