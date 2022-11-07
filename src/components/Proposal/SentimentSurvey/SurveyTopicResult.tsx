import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ReactionType, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import Pipe from '../../Common/Pipe'
import IconHelper from '../../Helper/IconHelper'

import { REACTIONS_VIEW } from './SentimentSurveyRow'
import './SurveyTopicResult.css'

interface Props {
  topic: Pick<SurveyTopicAttributes, 'topic_id' | 'label'>
}

const topicResult: Record<ReactionType, number> = {
  [ReactionType.INDIFFERENT]: 1,
  [ReactionType.ANGRY]: 2,
  [ReactionType.EMPTY]: 20,
  [ReactionType.HAPPY]: 4,
}

function createResultsBox(reactions: string[]) {
  return (
    <>
      {reactions.map((reactionType, index) => {
        const reactionView = REACTIONS_VIEW.find((reactionIcon) => reactionIcon.reaction === reactionType)
        if (reactionView) {
          return (
            <>
              <div className="ReactionCounter" key={`Reaction__${index}`}>
                <IconHelper text={reactionView.label} icon={reactionView.icon(16)} position={'bottom center'} />
                <span className="ReactionCount"> {topicResult[reactionType as ReactionType]} </span>
              </div>
              {index < reactions.length - 1 && <Pipe />}
            </>
          )
        } else {
          console.log(`Missing icon for reaction type ${reactionType}`)
        }
      })}
    </>
  )
}

const SurveyTopicResult = ({ topic }: Props) => {
  const t = useFormatMessage()

  const reactions = Object.keys(topicResult)
  return (
    <div className="SurveyTopicResult">
      <span className="SurveyTopicResult__Header">{t(`survey.survey_topics.${topic.label}`)}</span>
      <div className="SurveyTopicResult__ReactionContainer">{createResultsBox(reactions)}</div>
    </div>
  )
}

export default SurveyTopicResult
