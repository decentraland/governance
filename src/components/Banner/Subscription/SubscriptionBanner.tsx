import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'

import { HIDE_NEWSLETTER_SUBSCRIPTION_KEY } from '../../../hooks/useNewsletterSubscriptionModal'
import Email from '../../Icon/Email'
import Banner, { BannerProps, BannerState } from '../Banner'
import SubscriptionBannerAction from './SubscriptionBannerAction'

type SubscriptionBannerProps = {
  bannerState: BannerState
  active?: boolean
  onAction?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function SubscriptionBanner({ active, bannerState, onAction }: SubscriptionBannerProps) {
  const t = useFormatMessage()

  const bannerProps: BannerProps = {
    state: bannerState,
    title: t(`page.subscription_banner.title`),
    description: t(`page.subscription_banner.description`),
    active,
    bannerHideKey: HIDE_NEWSLETTER_SUBSCRIPTION_KEY,
    icon: <Email />,
    actionButton: <SubscriptionBannerAction onClick={onAction} />,
  }

  return <Banner {...bannerProps} />
}

export default React.memo(SubscriptionBanner)
