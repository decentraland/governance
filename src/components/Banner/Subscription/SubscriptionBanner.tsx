import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import React, { useEffect } from 'react'

import Email from '../../Icon/Email'
import Banner, { BannerProps, BannerState, ShowBanner } from '../Banner'

export const NEWSLETTER_SUBSCRIPTION_KEY: string = 'org.decentraland.governance.newsletter_subscription'
export const ANONYMOUS_USR_SUBSCRIPTION: string = 'anonymous_subscription'
export const HIDE_NEWSLETTER_SUBSCRIPTION_KEY: string = 'org.decentraland.governance.newsletter_subscription.hide'

type SubscriptionBannerProps = {
  bannerState: BannerState
  active?: boolean
  onAction?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const button = (label: string, onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) => {
  return (
    <Button className="Banner__Button" primary size="small" onClick={onClick}>
      {label}
    </Button>
  )
}

function SubscriptionBanner({ active, bannerState, onAction }: SubscriptionBannerProps) {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { setShowBanner } = bannerState

  useEffect(() => {
    const subscriptions: string[] = JSON.parse(localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY) || '[]')

    const showSubsBanner =
      localStorage.getItem(HIDE_NEWSLETTER_SUBSCRIPTION_KEY) != 'true' &&
      ((!account && !subscriptions.includes(ANONYMOUS_USR_SUBSCRIPTION)) ||
        (account && !subscriptions.includes(account)))
    setShowBanner(showSubsBanner ? ShowBanner.YES : ShowBanner.NO)
  }, [account])

  const bannerProps: BannerProps = {
    state: bannerState,
    title: t(`page.subscription_banner.title`),
    description: t(`page.subscription_banner.description`),
    active,
    bannerHideKey: HIDE_NEWSLETTER_SUBSCRIPTION_KEY,
    icon: <Email />,
    actionButton: button(t(`page.subscription_banner.subscribe_button_label`), onAction),
  }

  return <Banner {...bannerProps} />
}

export default React.memo(SubscriptionBanner)
