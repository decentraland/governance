import React, { useMemo } from 'react'

import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { SurveyDecoder } from '../../../entities/SurveyTopic/decoder'
import { ReactionType, Survey, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import { Vote } from '../../../entities/Votes/types'
import Divider from '../../Common/Divider'

import './SurveyResults.css'
import SurveyTopicResult from './SurveyTopicResult'

interface Props {
  votes: Record<string, Vote> | null
  isLoadingVotes: boolean
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
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

function initializeTopicResults(surveyTopics: Pick<SurveyTopicAttributes, 'topic_id' | 'label'>[]) {
  const topicsResults: Record<any, Record<any, any>> = {}
  for (const topic of surveyTopics) {
    topicsResults[topic.label] = initializeReactionCounters()
  }
  return topicsResults
}

function getResults(
  surveyTopics: Pick<SurveyTopicAttributes, 'topic_id' | 'label'>[] | null,
  votes: Record<string, Vote> | null
) {
  if (!surveyTopics || !votes) return {}
  const decoder = new SurveyDecoder(surveyTopics)
  const topicsResults = initializeTopicResults(surveyTopics)
  Object.keys(votes).map((key) => {
    const survey: Survey = decoder.decode(votes[key].reason)
    survey.map((topicFeedback) => {
      if (topicFeedback.reaction != ReactionType.EMPTY) {
        topicsResults[topicFeedback.topic.label][topicFeedback.reaction] += 1
      }
    })
  })
  return topicsResults
}

const SurveyResults = ({ votes, isLoadingVotes, surveyTopics, isLoadingSurveyTopics }: Props) => {
  const topicResults = useMemo(() => getResults(surveyTopics, votes), [surveyTopics, votes])
  const topicLabels = Object.keys(topicResults)
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
            <Header>Voter Sentiment</Header>
          </div>
          {topicLabels.map((label: string, index: any) => {
            return (
              <SurveyTopicResult
                key={`SurveyTopicResult__${index}`}
                topicLabel={label}
                topicResult={topicResults[label]}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SurveyResults
