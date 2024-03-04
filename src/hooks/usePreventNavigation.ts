import { useEffect, useRef } from 'react'

import { globalHistory } from '@reach/router'

import { navigate } from '../utils/locations'

import useFormatMessage from './useFormatMessage'

function usePreventNavigation(isActive: boolean, location = '/submit') {
  const confirmBack = useRef(false)
  const t = useFormatMessage()
  useEffect(() => {
    const preventNavigation = (event?: BeforeUnloadEvent) => {
      if (event) {
        event.preventDefault()
        event.returnValue = ''
      } else if (!window.confirm(t('navigation.exit'))) {
        navigate(location)
      } else {
        confirmBack.current = true
        navigate(location)
      }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isActive) {
        preventNavigation(event)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    const unsubscribe = globalHistory.listen(({ action }) => {
      if (isActive && (action === 'POP' || (action === 'PUSH' && !confirmBack.current))) {
        preventNavigation()
      }
    })

    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])
}

export default usePreventNavigation
