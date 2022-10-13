import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Loader } from 'decentraland-ui'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { SurveyTopicAttributes } from '../../entities/SurveyTopic/types'
import useSurveyTopics from '../../hooks/useSurveyTopics'
import { Survey } from '../Modal/Votes/VotingModal'

import './SentimentSurvey.css'
import SentimentSurveyRow, { ReactionType } from './SentimentSurveyRow'

interface Props {
  proposal: ProposalAttributes
  setSurvey: React.Dispatch<React.SetStateAction<Survey>>
}

export type Topic = Pick<SurveyTopicAttributes, 'topic_id' | 'label'>

const SentimentSurvey = ({ proposal, setSurvey }: Props) => {
  const t = useFormatMessage()
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal.id)

  const addToSurvey = (topic: Topic, reaction: ReactionType) => {
    setSurvey((prev) => {
      prev[topic.topic_id] = { topic, reaction }
      return prev
    })
  }

  const removeFromSurvey = (topic: Topic) => {
    setSurvey((prev) => {
      prev[topic.topic_id] = { topic, reaction: ReactionType.EMPTY }
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
