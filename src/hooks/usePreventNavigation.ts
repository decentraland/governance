import { useEffect, useRef } from 'react'

import { globalHistory, useLocation } from '@reach/router'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'

import locations from '../utils/locations'

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
        navigate(`${currentLocation.pathname}${currentLocation.search}`)
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

    const unsuscribe = globalHistory.listen(({ action, location }) => {
      if (
        isActive &&
        (action === 'POP' || (action === 'PUSH' && location.pathname === locations.proposals() && !confirmBack.current))
      ) {
        preventNavigation(`${location.pathname}${location.search}`)
      }
    })

    return () => {
      unsuscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, isActive])
}

export default usePreventNavigation
