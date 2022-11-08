import React from 'react'

import { ReactionType } from '../../../entities/SurveyTopic/types'
import Pipe from '../../Common/Pipe'
import IconHelper from '../../Helper/IconHelper'

import { REACTIONS_VIEW } from './SentimentSurveyRow'

interface Props {
  reactionType: ReactionType
  count: number
  drawPipe: boolean
}

const ReactionCounter = ({ reactionType, count, drawPipe }: Props) => {
  const reactionView = REACTIONS_VIEW.find((reactionIcon) => reactionIcon.reaction === reactionType)
  if (!reactionView) {
    console.log(`Missing icon for reaction type ${reactionType}`)
    return null
  }

  return (
    <>
      <div className="ReactionCounter">
        <IconHelper text={reactionView.label} icon={reactionView.icon(16)} position={'bottom center'} />
        <span className="ReactionCount"> {count}</span>
      </div>
      {drawPipe && <Pipe />}
    </>
  )
}

export default ReactionCounter
