import React from 'react'
import Progress from './Progress'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './ChoiceProgress.css'
import { ChoiceColor } from '../../entities/Votes/types'

export type ChoiceProgressProps = {
  choice: string,
  votes: number,
  progress: number
  color: ChoiceColor
}

export default function ChoiceProgress(props: ChoiceProgressProps) {
  const l = useFormatMessage()
  return <div className="ChoiceProgress">
    <div className="ChoiceProgress__Description">
      <div className="ChoiceProgress__Choice">
        {props.choice}
      </div>
      <div className="ChoiceProgress__Stats">
        {props.progress}% ({l('general.number', { value: props.votes })} VP)
      </div>
    </div>
    <Progress color={props.color} progress={props.progress} />
  </div>
}