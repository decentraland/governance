import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './DetailsSection.css'
import './SectionButton.css'

const subscribeIcon = require('../../images/icons/subscribe.svg').default
const subscribedIcon = require('../../images/icons/subscribed.svg').default

export type SubscribeButtonProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  loading?: boolean
  disabled?: boolean
  subscribed?: boolean
}

export default React.memo(function SubscribeButton({ loading, disabled, subscribed, ...props }: SubscribeButtonProps) {
  const t = useFormatMessage()
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className={TokenList.join([
        'DetailsSection',
        'SectionButton',
        'SubscribeButton',
        loading && 'SectionButton--loading',
        disabled && 'SectionButton--disabled',
        props.className,
      ])}
    >
      <Loader active={loading} size="small" />
      <img src={subscribed ? subscribedIcon : subscribeIcon} width="20" height="20" />
      <span>{t(subscribed ? 'page.proposal_detail.subscribed_button' : 'page.proposal_detail.subscribe_button')}</span>
    </a>
  )
})
