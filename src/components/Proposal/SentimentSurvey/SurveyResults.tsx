import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { SurveyDecoder } from '../../../entities/SurveyTopic/decoder'
import { ReactionType, Survey, SurveyTopicAttributes, Topic } from '../../../entities/SurveyTopic/types'
import { Vote } from '../../../entities/Votes/types'
import Divider from '../../Common/Divider'

import './SurveyResults.css'
import SurveyTopicResult from './SurveyTopicResult'

interface Props {
  votes: Record<string, Vote> | null
  isLoadingVotes: boolean
  surveyTopics: Topic[] | null
  isLoadingSurveyTopics: boolean
}

function initializeReactionCounters() {
  const reactionsCounters: Record<any, number> = {}
  for (const reactionType of Object.values(ReactionType)) {
    if (reactionType != ReactionType.EMPTY) {
      reactionsCounters[reactionType] = 0
    }
  }
  return reactionsCounters
}

function initializeTopicResults(surveyTopics: Topic[]) {
  const topicsResults: Record<any, Record<any, any>> = {}
  for (const topic of surveyTopics) {
    topicsResults[topic.topic_id] = initializeReactionCounters()
  }
  return topicsResults
}

function getResults(surveyTopics: Topic[] | null, votes: Record<string, Vote> | null) {
  if (!surveyTopics || !votes) return {}
  const decoder = new SurveyDecoder()
  const topicsResults = initializeTopicResults(surveyTopics)
  Object.keys(votes).map((key) => {
    const survey: Survey = decoder.decode(votes[key].reason)
    survey.map((topicFeedback) => {
      if (topicFeedback.reaction != ReactionType.EMPTY) {
        topicsResults[topicFeedback.topic.topic_id][topicFeedback.reaction] += 1
      }
    })
  })
  return topicsResults
}

const SurveyResults = ({ votes, isLoadingVotes, surveyTopics, isLoadingSurveyTopics }: Props) => {
  const t = useFormatMessage()
  const topicResults = useMemo(() => getResults(surveyTopics, votes), [surveyTopics, votes])
  const topicIds = Object.keys(topicResults)
  const thereAreVotes = votes && Object.keys(votes).length > 0 && !isLoadingVotes
  const thereAreSurveyTopics = surveyTopics && surveyTopics?.length > 0 && !isLoadingSurveyTopics

  if (!thereAreVotes || !thereAreSurveyTopics) {
    return null
  }

  return (
    <div className="SurveyResults">
      <Divider />
      {isLoadingSurveyTopics && <Loader />}
      {!isLoadingSurveyTopics && (
        <div>
          <div className="SurveyResults__Header">
            <Header>{t('survey.results.title')}</Header>
          </div>
          {topicIds.map((topicId: string, index: any) => {
            return (
              <SurveyTopicResult
                key={`SurveyTopicResult__${index}`}
                topicId={topicId}
                topicResult={topicResults[topicId]}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SurveyResults
