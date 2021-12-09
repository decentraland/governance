import React from 'react'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './DetailsSection.css'
import './SectionButton.css'

const subscribeIcon = require('../../images/icons/subscribe.svg')
const subscribedIcon = require('../../images/icons/subscribed.svg')

export type SubscribeButtonProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  loading?: boolean,
  disabled?: boolean,
  subscribed?: boolean,
}

export default React.memo(function SubscribeButton({ loading, disabled, subscribed, ...props }: SubscribeButtonProps) {
  const l = useFormatMessage()
  return <a {...props}
            target="_blank"
            rel="noopener noreferrer"
            className={TokenList.join([
              'DetailsSection',
              'SectionButton',
              'SubscribeButton',
              loading && 'SectionButton--loading',
              disabled && 'SectionButton--disabled',
              props.className
            ])}>
    <Loader active={loading} size="small" />
    <img src={subscribed ? subscribedIcon : subscribeIcon} width="20" height="20"/>
    <span>{l(subscribed ? 'page.proposal_detail.subscribed_button': 'page.proposal_detail.subscribe_button')}</span>
  </a>
})
