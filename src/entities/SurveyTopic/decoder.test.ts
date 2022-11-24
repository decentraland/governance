import { def, get } from 'bdd-lazy-var/getter'

import { SurveyDecoder } from './decoder'
import { ReactionType, Topic, TopicFeedback } from './types'
import { SURVEY_KEY } from './utils'

const TOPIC_1: Topic = { topic_id: '12345' }
const TOPIC_2: Topic = { topic_id: '22222' }
const TOPIC_3: Topic = { topic_id: '33333' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_2, reaction: ReactionType.LOVE },
  { topic: TOPIC_3, reaction: ReactionType.EMPTY },
]

describe('SurveyDecoder', () => {
  describe('decode', () => {
    def('decodedSurvey', () => new SurveyDecoder().decode(get.encodedSurvey))

    describe('and empty survey', () => {
      def('encodedSurvey', () => '')

      it('should be encoded into an empty array', () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })

    describe('a survey with different topic feedbacks', () => {
      def(
        'encodedSurvey',
        () =>
          `{"${SURVEY_KEY}": [{"topic":{"topic_id":"12345"},"reaction":"neutral"},{"topic":{"topic_id":"22222"},"reaction":"love"},{"topic":{"topic_id":"33333"},"reaction":"empty"}]}`
      )

      it('should be encoded into a sentiment survey', () => {
        expect(get.decodedSurvey).toEqual(SENTIMENT_SURVEY)
      })
    })

    describe('a survey with unknown topics and reactions', () => {
      def(
        'encodedSurvey',
        () =>
          `{"${SURVEY_KEY}": [{"topic":{"topic_id":"unknown"},"reaction":"unknown"},{"topic":{"topic_id":"whatevs"},"reaction":"whatevs"}]}`
      )

      it('returns a parsed survey', async () => {
        expect(get.decodedSurvey).toEqual([
          {
            reaction: 'unknown',
            topic: {
              topic_id: 'unknown',
            },
          },
          {
            reaction: 'whatevs',
            topic: {
              topic_id: 'whatevs',
            },
          },
        ])
      })
    })

    describe('a survey with no topics or reactions', () => {
      def('encodedSurvey', () => `{"${SURVEY_KEY}": [asd, asdasd, 🙂]}`)

      it('should return an empty survey', async () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })

    describe('a survey with a different format', () => {
      def('encodedSurvey', () => '[{"topic":{"label":"something"},"reaction": {}}}]')

      it('should return an empty survey', async () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })
  })
})
