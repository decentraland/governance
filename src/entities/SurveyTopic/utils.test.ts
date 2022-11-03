import { def, get } from 'bdd-lazy-var/getter'

import { ReactionType, Topic, TopicFeedback } from './types'
import { SurveyEncoder } from './utils'

const TOPIC_1: Topic = { topic_id: 'topic id 1', label: 'topic label 1' }
const TOPIC_2: Topic = { topic_id: 'topic id 2', label: 'topic label 2' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_2, reaction: ReactionType.HAPPY },
]

describe('SurveyEncoder', () => {
  describe('encode', () => {
    def('encodedSurvey', () => SurveyEncoder.encode(get.survey))

    describe('and empty survey', () => {
      def('survey', () => [])

      it('should be encoded into an empty array', () => {
        expect(get.encodedSurvey).toBe('')
      })
    })

    describe('a survey with different topic feedbacks', () => {
      def('survey', () => SENTIMENT_SURVEY)

      it('should be encoded into an empty string', () => {
        expect(get.encodedSurvey).toBe('topic id 1:indifferent|topic id 2:happy')
      })
    })
  })
})
