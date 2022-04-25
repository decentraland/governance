import React from 'react'
import useDelegationBanner from '../../hooks/useDelegationBanner'

import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'
import { NewsletterSubscriptionModal } from '../Modal/NewsletterSubscriptionModal'
import DelegationBanner from './Delegation/DelegationBanner'
import SubscriptionBanner from './Subscription/SubscriptionBanner'

interface Props {
  isVisible: boolean
}

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

  if (!showSubscriptionBanner) {
    return <DelegationBanner isVisible={isVisible} />
  }

  if (!showDelegationBanner) {
    return (
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
  }

  const now = new Date()

  return now.valueOf() % 2 === 0 ? (
    <DelegationBanner isVisible={isVisible} />
  ) : (
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
}

export default RandomBanner
