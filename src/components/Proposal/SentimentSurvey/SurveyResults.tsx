import { Ref, forwardRef, useMemo } from 'react'

import { decodeSurvey } from '../../../entities/SurveyTopic/decoder'
import { Reaction, Topic, TopicFeedback } from '../../../entities/SurveyTopic/types'
import { Vote } from '../../../entities/Votes/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Section from '../View/Section'

import SurveyTopicResult from './SurveyTopicResult'

interface Props {
  votes: Record<string, Vote> | null
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

const SurveyResults = forwardRef(({ votes, surveyTopics, isLoadingSurveyTopics }: Props, ref: Ref<HTMLDivElement>) => {
  const t = useFormatMessage()
  const topicResults = useMemo(() => getResults(surveyTopics, votes), [surveyTopics, votes])
  const topicIds = Object.keys(topicResults)

  return (
    <div ref={ref}>
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
    </div>
  )
})

export default SurveyResults
