import React from 'react'

import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'
import { NewsletterSubscriptionModal } from '../Modal/NewsletterSubscriptionModal/NewsletterSubscriptionModal'

import DelegationBanner, { shouldShowDelegationBanner } from './Delegation/DelegationBanner'
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

  if (!shouldShowDelegationBanner()) {
    return subscriptionBanner
  }

  return now.valueOf() % 2 === 0 ? delegationBanner : subscriptionBanner
}

export default RandomBanner
