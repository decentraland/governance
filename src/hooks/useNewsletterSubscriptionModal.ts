import { useState, useEffect } from 'react'
import useAuthContext from "decentraland-gatsby/dist/context/Auth/useAuthContext"
import { BannerState, ShowBanner } from '../components/Banner/Banner'

export const NEWSLETTER_SUBSCRIPTION_KEY: string = 'org.decentraland.governance.newsletter_subscription'
export const ANONYMOUS_USR_SUBSCRIPTION: string = 'anonymous_subscription'
export const HIDE_NEWSLETTER_SUBSCRIPTION_KEY: string = 'org.decentraland.governance.newsletter_subscription.hide'

function useNewsletterSubscriptionModal(bannerState: BannerState) {
  const [account] = useAuthContext()
  const [isOpen, setIsOpen] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const { setShowBanner } = bannerState

  useEffect(() => {
    const subscriptions: string[] = JSON.parse(localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY) || '[]')

    const showSubsBanner =
      localStorage.getItem(HIDE_NEWSLETTER_SUBSCRIPTION_KEY) != 'true' &&
      ((!account && !subscriptions.includes(ANONYMOUS_USR_SUBSCRIPTION)) ||
        (account && !subscriptions.includes(account)))
    setShowBanner(showSubsBanner ? ShowBanner.YES : ShowBanner.NO)
  }, [account])

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