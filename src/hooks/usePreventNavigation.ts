import { useEffect, useRef } from 'react'

import { globalHistory, useLocation } from '@reach/router'

import { toGovernancePathname } from '../helpers/browser'
import locations, { navigate } from '../utils/locations'

import useFormatMessage from './useFormatMessage'

function usePreventNavigation(isActive: boolean) {
  const currentLocation = useLocation()
  const confirmBack = useRef(false)
  const t = useFormatMessage()
  useEffect(() => {
    const preventNavigation = (location: string, event?: BeforeUnloadEvent) => {
      if (event) {
        event.preventDefault()
        event.returnValue = ''
      } else if (!window.confirm(t('navigation.exit'))) {
        const pathname = toGovernancePathname(currentLocation.pathname)
        navigate(`${pathname}${currentLocation.search}`)
      } else {
        confirmBack.current = true
        navigate(location)
      }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isActive) {
        preventNavigation('', event)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    const unsubscribe = globalHistory.listen(({ action, location }) => {
      const pathname = toGovernancePathname(location.pathname)

      if (
        isActive &&
        (action === 'POP' || (action === 'PUSH' && pathname === locations.proposals() && !confirmBack.current))
      ) {
        preventNavigation(`${pathname}${location.search}`)
      }
    })

    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, isActive])
}

export default usePreventNavigation
