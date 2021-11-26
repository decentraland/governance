import React from 'react'
import './SubscriptionBanner.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

const icon = require('../../images/icons/email-outline.svg')

export default function SubscriptionBanner() {
  const l = useFormatMessage()
  return <a className="SubscriptionBanner">
    <div className="SubscriptionBanner__Icon">
      <img src={icon} width="48" height="48" alt="email-outline"/>
    </div>
    <div className="SubscriptionBanner__Description">
      <Paragraph small semiBold>{l(`page.subscription_banner.title`)}</Paragraph>
      <Paragraph tiny>{l(`page.subscription_banner.description`)}</Paragraph>
    </div>
    <Button className="SubscriptionBanner__Button" primary size="small">
      {l(`page.subscription_banner.subscribe_button_label`)}
    </Button>
  </a>
}
