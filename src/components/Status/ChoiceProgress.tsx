import React from 'react'
import Progress from './Progress'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ChoiceColor } from '../../entities/Votes/types'
import './ChoiceProgress.css'

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
        <div className="ChoiceProgress__Choice">{props.choice}</div>
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
