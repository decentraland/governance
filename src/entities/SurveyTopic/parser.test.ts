import { def, get } from 'bdd-lazy-var/getter'

import SurveyTopicModel from './model'
import { SurveyParser } from './parser'
import { ReactionType, Topic, TopicFeedback } from './types'

const TOPIC_1: Topic = { topic_id: 'topic id 1', label: 'topic label 1' }
const TOPIC_2: Topic = { topic_id: 'topic id 2', label: 'topic label 2' }

const SENTIMENT_SURVEY: TopicFeedback[] = [
  { topic: TOPIC_1, reaction: ReactionType.INDIFFERENT },
  { topic: TOPIC_2, reaction: ReactionType.HAPPY },
]

describe('SurveyParser', () => {
  beforeAll(() => {
    jest.spyOn(SurveyTopicModel, 'findOne').mockImplementation((query) => {
      switch (query.id) {
        case TOPIC_1.topic_id:
          return Promise.resolve(TOPIC_1)
        case TOPIC_2.topic_id:
          return Promise.resolve(TOPIC_2)
        default:
          return Promise.resolve(undefined)
      }
    })
  })

  describe('encode', () => {
    def('encodedSurvey', () => SurveyParser.encode(get.survey))

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

  describe('decode', () => {
    def('decodedSurvey', async () => await SurveyParser.decode(get.encodedSurvey))

    describe('and empty survey', () => {
      def('encodedSurvey', () => '')

      it('should be encoded into an empty array', () => {
        expect(get.decodedSurvey).resolves.toEqual([])
      })
    })

    describe('a survey with different topic feedbacks', () => {
      def('encodedSurvey', () => 'topic id 1:indifferent|topic id 2:happy')

      it('should be encoded into an empty string', () => {
        expect(get.decodedSurvey).resolves.toEqual(SENTIMENT_SURVEY)
      })
    })

    describe('a survey with an unknown topic id', () => {
      def('encodedSurvey', () => 'topic id 3:indifferent|topic id 2:happy')

      it('should throw', () => {
        return expect(get.decodedSurvey).rejects.toThrowError('Unable to parse topic feedback topic id 3:indifferent')
      })
    })

    describe('a survey with an unknown reaction', () => {
      def('encodedSurvey', () => 'topic id 1:esquizofrenic|topic id 2:happy')

      it('should throw', () => {
        return expect(get.decodedSurvey).rejects.toThrowError('Unable to parse reaction esquizofrenic')
      })
    })
  })
})
