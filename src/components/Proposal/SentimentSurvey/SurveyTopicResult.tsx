import { Fragment } from 'react'

import { Reaction } from '../../../entities/SurveyTopic/types'
import useFormatMessage from '../../../hooks/useFormatMessage'

import Pipe from './Pipe'
import ReactionCounter from './ReactionCounter'
import './SurveyTopicResult.css'

interface Props {
  topicId: string
  topicResult: Record<Reaction, number>
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
              <ReactionCounter reactionType={reactionType as Reaction} count={topicResult[reactionType as Reaction]} />
              {!isTheLastReaction && <Pipe />}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default SurveyTopicResult
