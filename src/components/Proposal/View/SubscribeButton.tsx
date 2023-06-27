import React from 'react'

import classNames from 'classnames'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Subscribe from '../../Icon/Subscribe'
import Subscribed from '../../Icon/Subscribed'

import './DetailsSection.css'
import './SectionButton.css'

interface Props {
  loading: boolean
  disabled: boolean
  subscribed: boolean
  onClick: () => void
}

export default function SubscribeButton({ loading, disabled, subscribed, onClick }: Props) {
  const t = useFormatMessage()

  return (
    <button
      onClick={onClick}
      className={classNames(
        'DetailsSection',
        'SectionButton',
        loading && 'SectionButton--loading',
        disabled && 'SectionButton--disabled'
      )}
    >
      <div className="SectionButton__Container">
        <Loader active={loading} size="small" />
        {subscribed ? <Subscribed size="20" /> : <Subscribe size="20" />}
        <span>
          {t(subscribed ? 'page.proposal_detail.subscribed_button' : 'page.proposal_detail.subscribe_button')}
        </span>
      </div>
    </button>
  )
}
