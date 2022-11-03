import React, { useEffect } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Loader } from 'decentraland-ui'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { ReactionType, Survey, Topic, TopicFeedback } from '../../../entities/SurveyTopic/types'
import useSurveyTopics from '../../../hooks/useSurveyTopics'

import './SentimentSurvey.css'
import SentimentSurveyRow from './SentimentSurveyRow'

interface Props {
  proposal: ProposalAttributes
  setSurvey: React.Dispatch<React.SetStateAction<Survey>>
}

const SentimentSurvey = ({ proposal, setSurvey }: Props) => {
  const t = useFormatMessage()
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal.id)

  useEffect(() => {
    const newSurvey: TopicFeedback[] = []
    surveyTopics?.forEach((topic) => {
      newSurvey.push({ topic, reaction: ReactionType.EMPTY })
    })
    setSurvey(newSurvey)
  }, [surveyTopics, setSurvey])

  const addToSurvey = (topic: Topic, reaction: ReactionType) => {
    setSurvey((prev) => {
      const newSurvey = prev.filter((feedback) => feedback.topic.topic_id !== topic.topic_id)
      newSurvey.push({ topic, reaction })
      return newSurvey
    })
  }

  const removeFromSurvey = (topic: Topic) => {
    setSurvey((prev) => {
      const newSurvey = prev.filter((feedback) => feedback.topic.topic_id !== topic.topic_id)
      newSurvey.push({ topic, reaction: ReactionType.EMPTY })
      return newSurvey
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
