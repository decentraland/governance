import React, { useEffect, useState, useCallback } from 'react'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import {
  NewsletterSubscriptionModal,
  NEWSLETTER_SUBSCRIPTION_KEY,
  ANONYMOUS_USR_SUBSCRIPTION,
} from '../Modal/NewsletterSubscriptionModal'
import './SubscriptionBanner.css'

const icon = require('../../images/icons/email-outline.svg').default
const HIDE_NEWSLETTER_SUBSCRIPTION_KEY = 'org.decentraland.governance.newsletter_subscription.hide'

enum ShowSubscriptionBanner {
  YES,
  NO,
}

export type SubscriptionBannerProps = {
  active?: boolean
}

export default function SubscriptionBanner({ active }: SubscriptionBannerProps) {
  const [account] = useAuthContext()
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(ShowSubscriptionBanner.NO)
  const [confirmSubscription, setConfirmSubscription] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const t = useFormatMessage()

  useEffect(() => {
    const subscriptions: string[] = JSON.parse(localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY) || '[]')
    const showSubsBanner =
      localStorage.getItem(HIDE_NEWSLETTER_SUBSCRIPTION_KEY) != 'true' &&
      ((!account && !subscriptions.includes(ANONYMOUS_USR_SUBSCRIPTION)) ||
        (account && !subscriptions.includes(account)))
    setShowSubscriptionBanner(showSubsBanner ? ShowSubscriptionBanner.YES : ShowSubscriptionBanner.NO)
  }, [account])

  function finishSubscription() {
    setShowSubscriptionBanner(ShowSubscriptionBanner.NO)
    setSubscribed(true)
  }

  function closeSubscriptionBanner() {
    setConfirmSubscription(false)
    setSubscribed(false)
  }

  const handleClose = useCallback((e: React.MouseEvent<any>) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.setItem(HIDE_NEWSLETTER_SUBSCRIPTION_KEY, 'true')
    setShowSubscriptionBanner(ShowSubscriptionBanner.NO)
  }, [])

  return (
    <div>
      {showSubscriptionBanner == ShowSubscriptionBanner.YES && active && (
        <a className="SubscriptionBanner">
          <div className="SubscriptionBanner__Icon">
            <img src={icon} width="48" height="48" alt="email-outline" />
          </div>
          <div className="SubscriptionBanner__Content">
            <div className="SubscriptionBanner__Description">
              <Paragraph small semiBold>
                {t(`page.subscription_banner.title`)}
              </Paragraph>
              <Paragraph tiny>{t(`page.subscription_banner.description`)}</Paragraph>
            </div>
            <div className="SubscriptionBanner__ButtonContainer">
              <Button
                className="SubscriptionBanner__Button"
                primary
                size="small"
                onClick={() => setConfirmSubscription(true)}
              >
                {t(`page.subscription_banner.subscribe_button_label`)}
              </Button>
            </div>
          </div>
          <Close small onClick={handleClose} />
        </a>
      )}
      <NewsletterSubscriptionModal
        open={confirmSubscription}
        onSubscriptionSuccess={finishSubscription}
        subscribed={subscribed}
        onClose={closeSubscriptionBanner}
      />
    </div>
  )
}
