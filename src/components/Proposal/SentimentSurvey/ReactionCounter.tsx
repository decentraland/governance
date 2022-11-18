import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ReactionType } from '../../../entities/SurveyTopic/types'
import { REACTIONS_VIEW } from '../../../entities/SurveyTopic/utils'
import Pipe from '../../Common/Pipe'
import IconHelper from '../../Helper/IconHelper'

interface Props {
  reactionType: ReactionType
  count: number
  drawPipe: boolean
}

const ReactionCounter = ({ reactionType, count, drawPipe }: Props) => {
  const t = useFormatMessage()
  const reactionView = REACTIONS_VIEW.find((reactionIcon) => reactionIcon.reaction === reactionType)
  if (!reactionView) {
    console.log(`Missing icon for reaction type ${reactionType}`)
    return null
  }

  return (
    <>
      <div className="ReactionCounter">
        <IconHelper
          text={t(`component.reaction_icon.${reactionView.reaction}`)}
          icon={reactionView.icon}
          position={'bottom center'}
        />
        <span className="ReactionCount"> {count}</span>
      </div>
      {drawPipe && <Pipe />}
    </>
  )
}

export default ReactionCounter
