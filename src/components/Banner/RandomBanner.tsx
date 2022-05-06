import React from 'react'

import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'
import { NewsletterSubscriptionModal } from '../Modal/NewsletterSubscriptionModal'

import DelegationBanner, { HIDE_DELEGATE_BANNER_KEY } from './Delegation/DelegationBanner'
import SubscriptionBanner from './Subscription/SubscriptionBanner'

interface Props {
  isVisible: boolean
}

const now = new Date()

function RandomBanner({ isVisible }: Props) {
  const {
    showSubscriptionBanner,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    onSubscriptionSuccess,
    subscribed,
    onClose,
  } = useNewsletterSubscription()

  if (!isVisible) {
    return null
  }

  const delegationBanner = <DelegationBanner />

  const showDelegationBanner = localStorage.getItem(HIDE_DELEGATE_BANNER_KEY) !== 'true'

  const subscriptionBanner = (
    <>
      <SubscriptionBanner
        isVisible={showSubscriptionBanner && isVisible}
        onAction={() => setIsSubscriptionModalOpen(true)}
      />
      <NewsletterSubscriptionModal
        open={isSubscriptionModalOpen}
        onSubscriptionSuccess={onSubscriptionSuccess}
        subscribed={subscribed}
        onClose={onClose}
      />
    </>
  )

  if (!showSubscriptionBanner) {
    return delegationBanner
  }

  if (!showDelegationBanner) {
    return subscriptionBanner
  }

  return now.valueOf() % 2 === 0 ? delegationBanner : subscriptionBanner
}

export default RandomBanner
