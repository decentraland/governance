import React from 'react'
import useDelegationBanner from '../../hooks/useDelegationBanner'

import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'
import { NewsletterSubscriptionModal } from '../Modal/NewsletterSubscriptionModal'
import DelegationBanner from './Delegation/DelegationBanner'
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

  const showDelegationBanner = useDelegationBanner()

  const delegationBanner = <DelegationBanner isVisible={isVisible} />

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
