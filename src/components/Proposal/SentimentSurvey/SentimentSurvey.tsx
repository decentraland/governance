import { useEffect } from 'react'

import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Reaction, Survey, Topic } from '../../../entities/SurveyTopic/types'
import useFormatMessage from '../../../hooks/useFormatMessage'

import './SentimentSurvey.css'
import SentimentSurveyRow from './SentimentSurveyRow'

interface Props {
  survey: Survey
  surveyTopics: Topic[] | null
  isLoadingSurveyTopics: boolean
  setSurvey: React.Dispatch<React.SetStateAction<Survey>>
}

const SentimentSurvey = ({ survey, surveyTopics, isLoadingSurveyTopics, setSurvey }: Props) => {
  const t = useFormatMessage()

  useEffect(() => {
    if (!isLoadingSurveyTopics && survey.length === 0) {
      const newSurvey: Survey = []
      surveyTopics?.forEach((topic) => {
        newSurvey.push({ ...topic, reaction: Reaction.EMPTY })
      })
      setSurvey(newSurvey)
    }
  }, [survey, isLoadingSurveyTopics, surveyTopics, setSurvey])

  const addToSurvey = (topic: Topic, reaction: Reaction) => {
    setSurvey((prev) => {
      const newSurvey = prev.filter((feedback) => feedback.topic_id !== topic.topic_id)
      newSurvey.push({ ...topic, reaction })
      return newSurvey
    })
  }

  const removeFromSurvey = (topic: Topic) => {
    setSurvey((prev) => {
      const newSurvey = prev.filter((feedback) => feedback.topic_id !== topic.topic_id)
      newSurvey.push({ ...topic, reaction: Reaction.EMPTY })
      return newSurvey
    })
  }

  return (
    <div className="SentimentSurvey">
      {isLoadingSurveyTopics && <Loader active={isLoadingSurveyTopics} />}
      {!isLoadingSurveyTopics && (
        <>
          <div className="SentimentSurvey__Header">
            <span>{t('survey.topics_title')}</span>
            <span>{t('survey.reactions_title')}</span>
          </div>
          {surveyTopics?.map((topic, index) => (
            <SentimentSurveyRow
              key={`SentimentSurveyRow_${index}`}
              topic={topic}
              reaction={survey.find((feedback) => feedback.topic_id === topic.topic_id)?.reaction}
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
