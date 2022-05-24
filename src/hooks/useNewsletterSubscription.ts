import { useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import {
  ANONYMOUS_USR_SUBSCRIPTION,
  HIDE_NEWSLETTER_SUBSCRIPTION_KEY,
  NEWSLETTER_SUBSCRIPTION_KEY,
} from '../components/Banner/Subscription/SubscriptionBanner'

function useNewsletterSubscription() {
  const [isOpen, setIsOpen] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const [account, { loading }] = useAuthContext()

  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (!loading) {
      const subscriptions: string[] = JSON.parse(localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY) || '[]')
      setShowBanner(
        localStorage.getItem(HIDE_NEWSLETTER_SUBSCRIPTION_KEY) != 'true' &&
        ((!account && !subscriptions.includes(ANONYMOUS_USR_SUBSCRIPTION)) ||
          (!!account && !subscriptions.includes(account)))
      )
    }
  }, [account, loading])

  function finishSubscription() {
    setSubscribed(true)
    setShowBanner(false)
  }

  function closeSubscriptionBanner() {
    setIsOpen(false)
    setSubscribed(false)
  }

  return {
    showSubscriptionBanner: showBanner,
    isSubscriptionModalOpen: isOpen,
    setIsSubscriptionModalOpen: setIsOpen,
    onSubscriptionSuccess: finishSubscription,
    subscribed,
    onClose: closeSubscriptionBanner,
  }
}

export default useNewsletterSubscription
