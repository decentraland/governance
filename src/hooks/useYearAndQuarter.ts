import { useMemo } from 'react'

import { useLocation } from '@reach/router'

import { validateQuarter, validateYear } from '../helpers'
import Time from '../utils/date/Time'

function useYearAndQuarter() {
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const yearParam = params.get('year')
  const quarterParam = params.get('quarter')
  const year = validateYear(yearParam) ?? Time().year()
  const quarter = validateQuarter(quarterParam) ?? Time().quarter()

  return {
    year,
    quarter,
  }
}

export default useYearAndQuarter
