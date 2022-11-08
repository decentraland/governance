import { def, get } from 'bdd-lazy-var/getter'

import { ReactionType, Topic, TopicFeedback } from './types'
import { MAX_CHARS_IN_SNAPSHOT_REASON, SurveyEncoder } from './utils'

const TOPIC_1: Topic = { topic_id: 'topic id 1', label: 'topic label 1' }
const TOPIC_2: Topic = { topic_id: 'topic id 2', label: 'topic label 2' }

const TOPIC_3: Topic = { topic_id: '33333333333333333333', label: '20 chars topic' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_2, reaction: ReactionType.HAPPY },
]

const LONG_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_3, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_3, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_3, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_3, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_3, reaction: ReactionType.INDIFFERENT },
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
    describe('for a long survey that encodes into more than 140 chars', () => {
      def('survey', () => LONG_SURVEY)

      it('returns a trimmed survey with 140 chars or less', () => {
        expect(get.encodedSurvey).toBe(
          '33333333333333333333:indifferent|33333333333333333333:indifferent|33333333333333333333:indifferent|33333333333333333333:indifferent'
        )
        expect(get.encodedSurvey.length).toBeLessThanOrEqual(MAX_CHARS_IN_SNAPSHOT_REASON)
      })
    })
  })
})
