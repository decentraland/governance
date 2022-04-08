import { useState } from 'react'
import { BannerState, ShowBanner } from '../components/Banner/Banner'

function useNewsletterSubscriptionModal(bannerState: BannerState) {
  const [isOpen, setIsOpen] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const { setShowBanner } = bannerState

  function finishSubscription() {
    setShowBanner(ShowBanner.NO)
    setSubscribed(true)
  }

  function closeSubscriptionBanner() {
    setIsOpen(false)
    setSubscribed(false)
  }

  return {
    openState: {
      isOpen,
      setIsOpen
    },
    onSubscriptionSuccess: finishSubscription,
    subscribed,
    onclose: closeSubscriptionBanner
  }

}

export default useNewsletterSubscriptionModal