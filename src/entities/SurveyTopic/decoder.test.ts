import { def, get } from 'bdd-lazy-var/getter'

import { SurveyDecoder } from './decoder'
import { ReactionType, Topic, TopicFeedback } from './types'

const TOPIC_1: Topic = { topic_id: '12345', label: 'topic label 1' }
const TOPIC_2: Topic = { topic_id: '22222', label: 'topic label 2' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.NEUTRAL },
  { topic: TOPIC_2, reaction: ReactionType.LOVE },
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
      def('encodedSurvey', () => '12345:😐,22222:🥰')

      it('should be encoded into an empty string', () => {
        expect(get.decodedSurvey).toEqual(SENTIMENT_SURVEY)
      })
    })

    describe('a survey with an unknown topic id', () => {
      def('encodedSurvey', () => 'topic id XXX:😐,22222:🥰')

      it('should only return the topics it can decode', () => {
        expect(get.decodedSurvey).toEqual([{ topic: TOPIC_2, reaction: ReactionType.LOVE }])
      })
    })

    describe('a survey with an unknown reaction', () => {
      def('encodedSurvey', () => 'topic id 1:🤔,22222:🥰')

      it('should only return the reactions it can decode', async () => {
        expect(get.decodedSurvey).toEqual([{ topic: TOPIC_2, reaction: ReactionType.LOVE }])
      })
    })

    describe('a survey with unknown topics and reactions', () => {
      def('encodedSurvey', () => 'topic id 1:🤔,topic id XXX:happy')

      it('should return an empty survey', async () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })

    describe('a survey with no topics or reactions', () => {
      def('encodedSurvey', () => 'asd asdasd 🙂')

      it('should return an empty survey', async () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })

    describe('a survey with no topics or reactions', () => {
      def('encodedSurvey', () => ',asd🙂 ,asdasd 🙂')

      it('should return an empty survey', async () => {
        expect(get.decodedSurvey).toEqual([])
      })
    })
  })
})
