import React, { useEffect } from 'react'

import { Loader } from 'decentraland-ui'

import { ReactionType, Survey, SurveyTopicAttributes, Topic, TopicFeedback } from '../../../entities/SurveyTopic/types'

import './SentimentSurvey.css'
import SentimentSurveyRow from './SentimentSurveyRow'

interface Props {
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
  isLoadingSurveyTopics: boolean
  setSurvey: React.Dispatch<React.SetStateAction<Survey>>
}

const SentimentSurvey = ({ surveyTopics, isLoadingSurveyTopics, setSurvey }: Props) => {
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
