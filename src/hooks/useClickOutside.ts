import { useEffect } from 'react'

export function useClickOutside(selector: string, shouldListen: boolean, onClickOutside?: () => void) {
  return useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const element = document.querySelector(selector)
      if (element && !element.contains(event.target as Node) && !!onClickOutside) {
        event.preventDefault()
        event.stopPropagation()
        onClickOutside()
      }
    }

    if (shouldListen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selector, shouldListen, onClickOutside])
}
