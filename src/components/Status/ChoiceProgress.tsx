import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ChoiceColor } from '../../entities/Votes/types'
import TextWithTooltip from '../Section/TextWithTooltip'

import './ChoiceProgress.css'
import Progress from './Progress'

export type ChoiceProgressProps = {
  choice: string
  votes: number
  power: number
  progress: number
  color: ChoiceColor
}

export default function ChoiceProgress(props: ChoiceProgressProps) {
  const t = useFormatMessage()
  return (
    <div className="ChoiceProgress">
      <div className="ChoiceProgress__Description">
        <TextWithTooltip className="ChoiceProgress__Choice">{props.choice}</TextWithTooltip>
        <div className="ChoiceProgress__Stats">{props.progress}%</div>
      </div>
      <Progress color={props.color} progress={props.progress} />
      <div className="ChoiceProgress__Votes">
        <strong>
          {t('general.number', { value: props.power })}
          {' VP '}
        </strong>
        <span>({t('general.count_votes', { count: props.votes })})</span>
      </div>
    </div>
  )
}
