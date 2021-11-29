import React, { useEffect, useState } from 'react'
import './SubscriptionBanner.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { NewsletterSubscriptionModal, NEWSLETTER_SUBSCRIPTION_KEY } from '../Modal/NewsletterSubscriptionModal'

const icon = require('../../images/icons/email-outline.svg')

enum ShowSubscriptionBanner {
  Loading,
  YES,
  NO
}

export default function SubscriptionBanner() {
  const [account] = useAuthContext()
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(ShowSubscriptionBanner.Loading)
  const [confirmSubscription, setConfirmSubscription] = useState(false)
  const l = useFormatMessage()

  useEffect(() => {
    const subscription = localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY)
    setShowSubscriptionBanner(subscription !== account ? ShowSubscriptionBanner.YES : ShowSubscriptionBanner.NO)
  }, [account])

  function finishSubscription(){
    setShowSubscriptionBanner(ShowSubscriptionBanner.NO)
  }

  if (showSubscriptionBanner === ShowSubscriptionBanner.Loading) {
    return <div className="SubscriptionBanner">
      <Loader size="huge" active />
    </div>
  }

  return <div>
    {showSubscriptionBanner == ShowSubscriptionBanner.YES && <a className="SubscriptionBanner">
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
      onClose={() => setConfirmSubscription(false)}
    />
  </div>
}
