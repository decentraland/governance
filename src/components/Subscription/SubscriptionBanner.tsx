import React, { useEffect, useState } from 'react'
import './SubscriptionBanner.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import {
  NewsletterSubscriptionModal,
  NEWSLETTER_SUBSCRIPTION_KEY,
  ANONYMOUS_USR_SUBSCRIPTION
} from '../Modal/NewsletterSubscriptionModal'

const icon = require('../../images/icons/email-outline.svg')

enum ShowSubscriptionBanner {
  Loading,
  YES,
  NO
}

export type SubscriptionBannerProps = {
  active?: boolean
}

export default function SubscriptionBanner({active}: SubscriptionBannerProps) {
  const [account] = useAuthContext()
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(ShowSubscriptionBanner.Loading)
  const [confirmSubscription, setConfirmSubscription] = useState(false)
  const [subscribed, setSubscribed] = useState(false);
  const l = useFormatMessage()

  useEffect(() => {
    const subscriptions:string[] = JSON.parse(localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY) || '[]');
    const showSubsBanner = !account && !subscriptions.includes(ANONYMOUS_USR_SUBSCRIPTION) || account && !subscriptions.includes(account)
    setShowSubscriptionBanner(showSubsBanner ? ShowSubscriptionBanner.YES : ShowSubscriptionBanner.NO)
  }, [account])

  function finishSubscription(){
    setShowSubscriptionBanner(ShowSubscriptionBanner.NO)
    setSubscribed(true)
  }

  function closeSubscriptionBanner(){
    setConfirmSubscription(false)
    setSubscribed(false)
  }

  if (showSubscriptionBanner === ShowSubscriptionBanner.Loading) {
    return <div className="SubscriptionBanner">
      <Loader size="huge" active />
    </div>
  }

  return <div>
    {showSubscriptionBanner == ShowSubscriptionBanner.YES && active && <a className="SubscriptionBanner">
      <div className="SubscriptionBanner__Icon">
        <img src={icon} width="48" height="48" alt="email-outline" />
      </div>
      <div className="SubscriptionBanner__Description">
        <Paragraph small semiBold>{l(`page.subscription_banner.title`)}</Paragraph>
        <Paragraph tiny>{l(`page.subscription_banner.description`)}</Paragraph>
      </div>
      <Button className="SubscriptionBanner__Button" primary size="small" onClick={() => setConfirmSubscription(true)}>
        {l(`page.subscription_banner.subscribe_button_label`)}
      </Button>
    </a>}
    <NewsletterSubscriptionModal
      open={confirmSubscription}
      onSubscriptionSuccess={finishSubscription}
      subscribed={subscribed}
      onClose={closeSubscriptionBanner}
    />
  </div>
}
