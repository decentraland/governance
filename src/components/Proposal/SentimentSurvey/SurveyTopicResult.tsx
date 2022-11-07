import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ReactionType } from '../../../entities/SurveyTopic/types'

import ReactionCounter from './ReactionCounter'
import './SurveyTopicResult.css'

interface Props {
  topicLabel: string
  topicResult: Record<ReactionType, number>
}

const SurveyTopicResult = ({ topicLabel, topicResult }: Props) => {
  const t = useFormatMessage()
  const reactions = Object.keys(topicResult)
  return (
    <div className="SurveyTopicResult">
      <span className="SurveyTopicResult__Header">{t(`survey.survey_topics.${topicLabel}`)}</span>
      <div className="SurveyTopicResult__ReactionContainer">
        {reactions.map((reactionType, index) => (
          <ReactionCounter
            key={`ReactionCounter__${index}`}
            reactionType={reactionType as ReactionType}
            count={topicResult[reactionType as ReactionType]}
            drawPipe={index < reactions.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

export default SurveyTopicResult
