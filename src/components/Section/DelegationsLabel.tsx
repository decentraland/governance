import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { DelegationsLabelProps } from '../../entities/Votes/utils'

import './DelegationsLabel.css'

const DelegationsLabel = ({ delegateLabel, delegatorsLabel }: DelegationsLabelProps) => {
  const t = useFormatMessage()
  return (
    <span className={'DelegationsLabel'}>
      {delegateLabel && (
        <Markdown className="DelegationsLabel__Text">{t(delegateLabel.id, delegateLabel.values)}</Markdown>
      )}
      {delegatorsLabel && (
        <Markdown className="DelegationsLabel__Text">{t(delegatorsLabel.id, delegatorsLabel.values)}</Markdown>
      )}
    </span>
  )
}

export default DelegationsLabel
