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

export default function ChoiceProgress({ choice, progress, power, color, votes }: ChoiceProgressProps) {
  const t = useFormatMessage()

  return (
    <div className="ChoiceProgress">
      <div className="ChoiceProgress__Description">
        <TextWithTooltip className="ChoiceProgress__Choice">{choice}</TextWithTooltip>
        <div className="ChoiceProgress__Stats">{progress}%</div>
      </div>
      <Progress color={color} progress={progress} />
      <div className="ChoiceProgress__Votes">
        <strong>
          {t('general.number', { value: power })}
          {' VP '}
        </strong>
        <span>({t('general.count_votes', { count: votes })})</span>
      </div>
    </div>
  )
}
