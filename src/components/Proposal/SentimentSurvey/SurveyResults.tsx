import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { decodeSurvey } from '../../../entities/SurveyTopic/decoder'
import { Reaction, Topic, TopicFeedback } from '../../../entities/SurveyTopic/types'
import { Vote } from '../../../entities/Votes/types'
import Section from '../View/Section'

import SurveyTopicResult from './SurveyTopicResult'

interface Props {
  votes: Record<string, Vote> | null
  isLoadingVotes: boolean
  surveyTopics: Topic[] | null
  isLoadingSurveyTopics: boolean
}

function initializeReactionCounters() {
  const reactionsCounters: Record<any, number> = {}
  for (const reactionType of Object.values(Reaction)) {
    if (reactionType != Reaction.EMPTY) {
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

function isTopicAvailable(availableTopics: Topic[], topicFeedback: TopicFeedback) {
  return availableTopics.find((topic) => topic.topic_id === topicFeedback.topic_id)
}

function getResults(availableTopics: Topic[] | null, votes: Record<string, Vote> | null) {
  if (!availableTopics || !votes) return {}
  const topicsResults = initializeTopicResults(availableTopics)
  Object.keys(votes).map((key) => {
    const survey = decodeSurvey(votes[key].metadata)
    survey.map((topicFeedback) => {
      if (isTopicAvailable(availableTopics, topicFeedback) && topicFeedback.reaction !== Reaction.EMPTY) {
        topicsResults[topicFeedback.topic_id][topicFeedback.reaction] += 1
      }
    })
  })
  return topicsResults
}

const SurveyResults = ({ votes, isLoadingVotes, surveyTopics, isLoadingSurveyTopics }: Props) => {
  const t = useFormatMessage()
  const topicResults = useMemo(() => getResults(surveyTopics, votes), [surveyTopics, votes])
  const topicIds = Object.keys(topicResults)
  const hasVotes = votes && Object.keys(votes).length > 0 && !isLoadingVotes
  const hasSurveyTopics = surveyTopics && surveyTopics?.length > 0 && !isLoadingSurveyTopics

  if (!hasVotes || !hasSurveyTopics) {
    return null
  }

  return (
    <Section title={t('survey.results.title')} isLoading={isLoadingSurveyTopics}>
      {topicIds.map((topicId: string, index: number) => {
        return (
          <SurveyTopicResult
            key={`SurveyTopicResult__${index}`}
            topicId={topicId}
            topicResult={topicResults[topicId]}
          />
        )
      })}
    </Section>
  )
}

export default SurveyResults
