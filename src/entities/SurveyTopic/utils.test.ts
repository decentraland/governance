import { def, get } from 'bdd-lazy-var/getter'

import { ReactionType, Topic, TopicFeedback } from './types'
import { MAX_CHARS_IN_SNAPSHOT_REASON, SurveyEncoder } from './utils'

const TOPIC_1: Topic = { topic_id: '12345', label: 'budget' }
const TOPIC_2: Topic = { topic_id: '22222', label: 'beneficiary' }

const TOPIC_3: Topic = { topic_id: '33333', label: 'topic with long label' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_2, reaction: ReactionType.LOVE },
]

const LONG_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_3, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_2, reaction: ReactionType.LIKE },
  { topic: TOPIC_1, reaction: ReactionType.LOVE },
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

      it('should be encoded into string', () => {
        expect(get.encodedSurvey).toBe('12345:😐,22222:🥰')
      })
    })
    describe('for a long survey that encodes into more than 140 chars', () => {
      def('survey', () => LONG_SURVEY)

      it('returns a trimmed survey with 140 chars or less', () => {
        expect(get.encodedSurvey).toBe(
          '33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,33333:😐,22222:😊'
        )
        expect(get.encodedSurvey.length).toBeLessThanOrEqual(MAX_CHARS_IN_SNAPSHOT_REASON)
      })
    })
  })
})
