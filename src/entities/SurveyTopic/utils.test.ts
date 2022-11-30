import { def, get } from 'bdd-lazy-var/getter'

import { Reaction, Topic, TopicFeedback } from './types'
import { SurveyEncoder } from './utils'

const TOPIC_1: Topic = { topic_id: '12345' }
const TOPIC_2: Topic = { topic_id: '22222' }
const TOPIC_3: Topic = { topic_id: '33333' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { ...TOPIC_1, reaction: Reaction.NEUTRAL },
  { ...TOPIC_2, reaction: Reaction.LOVE },
  { ...TOPIC_3, reaction: Reaction.EMPTY },
]

describe('SurveyEncoder', () => {
  describe('encode', () => {
    def('encodedSurvey', () => SurveyEncoder.encode(get.survey))

    describe('and empty survey', () => {
      def('survey', () => [])

      it('should be encoded into an empty array', () => {
        expect(get.encodedSurvey).toBe('{"survey":[]}')
      })
    })

    describe('a survey with different topic feedbacks', () => {
      def('survey', () => SENTIMENT_SURVEY)

      it('should be an object containing the survey array', () => {
        expect(get.encodedSurvey).toBe(
          `{"survey":[{"topic_id":"12345","reaction":"neutral"},{"topic_id":"22222","reaction":"love"},{"topic_id":"33333","reaction":"empty"}]}`
        )
      })
    })
  })
})
