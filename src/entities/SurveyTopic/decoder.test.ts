import { def, get } from 'bdd-lazy-var/getter'

import { SurveyDecoder } from './decoder'
import { ReactionType, Topic, TopicFeedback } from './types'

const TOPIC_1: Topic = { topic_id: 'topic id 1', label: 'topic label 1' }
const TOPIC_2: Topic = { topic_id: 'topic id 2', label: 'topic label 2' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_2, reaction: ReactionType.HAPPY },
]

describe('SurveyDecoder', () => {
  describe('decode', () => {
    def('decodedSurvey', () => new SurveyDecoder([TOPIC_1, TOPIC_2]).decode(get.encodedSurvey))

    describe('and empty survey', () => {
      def('encodedSurvey', () => '')

      it('should be encoded into an empty array', () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })

    describe('a survey with different topic feedbacks', () => {
      def('encodedSurvey', () => 'topic id 1:indifferent|topic id 2:happy')

      it('should be encoded into an empty string', () => {
        expect(get.decodedSurvey).toEqual(SENTIMENT_SURVEY)
      })
    })

    describe('a survey with an unknown topic id', () => {
      def('encodedSurvey', () => 'topic id XXX:indifferent|topic id 2:happy')

      it('should only return the topics it can decode', () => {
        expect(get.decodedSurvey).toEqual([{ topic: TOPIC_2, reaction: ReactionType.HAPPY }])
      })
    })

    describe('a survey with an unknown reaction', () => {
      def('encodedSurvey', () => 'topic id 1:esquizofrenic|topic id 2:happy')

      it('should only return the reactions it can decode', async () => {
        expect(get.decodedSurvey).toEqual([{ topic: TOPIC_2, reaction: ReactionType.HAPPY }])
      })
    })

    describe('a survey with unknown topics and reactions', () => {
      def('encodedSurvey', () => 'topic id 1:esquizofrenic|topic id XXX:happy')

      it('should return an empty survey', async () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })
  })
})
