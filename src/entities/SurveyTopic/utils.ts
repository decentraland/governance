import { Survey } from './types'

export const TOPIC_REACTION_CONCAT = ':'
export const TOPIC_SEPARATOR = '|'

export class SurveyEncoder {
  static encode(survey?: Survey | null): string {
    if (!survey || survey.length < 1) return ''

    let encoded = ''
    survey.forEach((topicFeedback, index) => {
      if (index > 0) encoded = encoded.concat(TOPIC_SEPARATOR)
      encoded = encoded.concat(topicFeedback.topic.topic_id + TOPIC_REACTION_CONCAT + topicFeedback.reaction)
    })
    return encoded
  }
}
