import { useEffect, useRef } from 'react'

import { globalHistory, useLocation } from '@gatsbyjs/reach-router'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'

import locations from '../modules/locations'

function usePreventNavigation() {
  const currentLocation = useLocation()
  const confirmBack = useRef(false)
  useEffect(() => {
    const preventNavigation = (location: string, event?: BeforeUnloadEvent) => {
      if (event) {
        event.preventDefault()
        // event.stopImmediatePropagation()
        event.returnValue = ''
      } else if (!window.confirm('Are you sure you want to exit?')) {
        navigate(`${currentLocation.pathname}`)
      } else {
        confirmBack.current = true
        navigate(location)
      }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => preventNavigation('', event)

    window.addEventListener('beforeunload', handleBeforeUnload)

    const unsuscribe = globalHistory.listen(({ action, location }) => {
      console.log(action, location)
      if (
        action === 'POP' ||
        (action === 'PUSH' && location.pathname === locations.proposals() && !confirmBack.current)
      ) {
        preventNavigation(location.pathname)
      }
    })

    return () => {
      unsuscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [currentLocation])
}

export default usePreventNavigation
