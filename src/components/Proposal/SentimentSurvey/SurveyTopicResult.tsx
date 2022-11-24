import React, { Fragment } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ReactionType } from '../../../entities/SurveyTopic/types'
import Pipe from '../../Common/Pipe'

import ReactionCounter from './ReactionCounter'
import './SurveyTopicResult.css'

interface Props {
  topicId: string
  topicResult: Record<ReactionType, number>
}

const SurveyTopicResult = ({ topicId, topicResult }: Props) => {
  const t = useFormatMessage()
  const reactions = Object.keys(topicResult)
  return (
    <div className="SurveyTopicResult">
      <span className="SurveyTopicResult__Header">{t(`survey.survey_topics.${topicId}`)}</span>
      <div className="SurveyTopicResult__ReactionContainer">
        {reactions.map((reactionType, index) => {
          const isTheLastReaction = index === reactions.length - 1
          return (
            <Fragment key={`ReactionCounter__${index}`}>
              <ReactionCounter
                reactionType={reactionType as ReactionType}
                count={topicResult[reactionType as ReactionType]}
              />
              {!isTheLastReaction && <Pipe />}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default SurveyTopicResult
