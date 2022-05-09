import { useEffect, useState } from 'react'
import { HIDE_DELEGATE_BANNER_KEY } from '../components/Banner/Delegation/DelegationBanner'

function useDelegationBanner() {

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(localStorage.getItem(HIDE_DELEGATE_BANNER_KEY) !== 'true')
  }, [])

  return isVisible
}

export default useDelegationBanner