import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Loader } from 'decentraland-ui'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { SurveyTopicAttributes } from '../../entities/SurveyTopic/types'
import useSurveyTopics from '../../hooks/useSurveyTopics'
import { Feedback } from '../Modal/Votes/VotingModal'

import './SentimentSurvey.css'
import SentimentSurveyRow, { Reaction } from './SentimentSurveyRow'

interface Props {
  proposal: ProposalAttributes
}

export type Topic = Pick<SurveyTopicAttributes, 'topic_id' | 'label'>

const SentimentSurvey = ({ proposal }: Props) => {
  const t = useFormatMessage()
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal.id)
  const [survey, setSurvey] = useState<Feedback>({})

  const addToSurvey = (topic: Topic, reaction: Reaction) => {
    setSurvey((prev) => {
      prev[topic.topic_id] = reaction.type
      return prev
    })
  }

  const removeFromSurvey = (topic: Topic) => {
    setSurvey((prev) => {
      prev[topic.topic_id] = null
      return prev
    })
  }

  return (
    <div className="SentimentSurvey">
      {isLoadingSurveyTopics && <Loader active={isLoadingSurveyTopics} />}
      {!isLoadingSurveyTopics && (
        <>
          <div className="SentimentSurvey__Header">
            <span>{'Topics'}</span>
            <span>{'Reaction'}</span>
          </div>
          {surveyTopics?.map((topic, index) => (
            <SentimentSurveyRow
              key={`SentimentSurveyRow_${index}`}
              topic={topic}
              onReactionPicked={addToSurvey}
              onReactionUnpicked={removeFromSurvey}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default SentimentSurvey
