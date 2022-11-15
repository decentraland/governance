import React, { useEffect } from 'react'

import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ReactionType, Survey, SurveyTopicAttributes, Topic } from '../../../entities/SurveyTopic/types'

import './SentimentSurvey.css'
import SentimentSurveyRow from './SentimentSurveyRow'

interface Props {
  survey: Survey
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
  isLoadingSurveyTopics: boolean
  setSurvey: React.Dispatch<React.SetStateAction<Survey>>
}

const SentimentSurvey = ({ survey, surveyTopics, isLoadingSurveyTopics, setSurvey }: Props) => {
  useEffect(() => {
    if (!isLoadingSurveyTopics) {
      if (survey.length === 0) {
        const newSurvey: Survey = []
        surveyTopics?.forEach((topic) => {
          newSurvey.push({ topic, reaction: ReactionType.EMPTY })
        })
        setSurvey(newSurvey)
      }
    }
  }, [survey, isLoadingSurveyTopics, surveyTopics, setSurvey])

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
              reaction={survey.find((feedback) => feedback.topic.topic_id === topic.topic_id)?.reaction}
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
