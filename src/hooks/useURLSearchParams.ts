import { useMemo } from 'react'

import { useLocation } from '@reach/router'

export default function useURLSearchParams() {
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  return params
}
