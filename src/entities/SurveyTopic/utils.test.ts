import { def, get } from 'bdd-lazy-var/getter'

import { ReactionType, Topic, TopicFeedback } from './types'
import { SURVEY_KEY, SurveyEncoder } from './utils'

const TOPIC_1: Topic = { topic_id: '12345' }
const TOPIC_2: Topic = { topic_id: '22222' }
const TOPIC_3: Topic = { topic_id: '33333' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_2, reaction: ReactionType.LOVE },
  { topic: TOPIC_3, reaction: ReactionType.EMPTY },
]

describe('SurveyEncoder', () => {
  describe('encode', () => {
    def('encodedSurvey', () => SurveyEncoder.encode(get.survey))

    describe('and empty survey', () => {
      def('survey', () => [])

      it('should be encoded into an empty array', () => {
        expect(get.encodedSurvey).toBe('{}')
      })
    })

    describe('a survey with different topic feedbacks', () => {
      def('survey', () => SENTIMENT_SURVEY)

      it('should be an object containing the survey array', () => {
        expect(get.encodedSurvey).toBe(
          `{"${SURVEY_KEY}": [{"topic":{"topic_id":"12345"},"reaction":"neutral"},{"topic":{"topic_id":"22222"},"reaction":"love"},{"topic":{"topic_id":"33333"},"reaction":"empty"}]}`
        )
      })
    })
  })
})
