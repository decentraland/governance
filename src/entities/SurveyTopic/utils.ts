import { Survey } from './types'

export const TOPIC_REACTION_CONCAT = ':'
export const TOPIC_SEPARATOR = '|'
export const MAX_CHARS_IN_SNAPSHOT_REASON = 140

export class SurveyEncoder {
  static encode(survey?: Survey | null): string {
    if (!survey || survey.length < 1) return ''

    let encodedAccumulator = ''
    survey.forEach((topicFeedback, index) => {
      const encodedTopic = topicFeedback.topic.topic_id + TOPIC_REACTION_CONCAT + topicFeedback.reaction
      if (encodedAccumulator.length + encodedTopic.length + TOPIC_SEPARATOR.length <= MAX_CHARS_IN_SNAPSHOT_REASON) {
        if (index > 0) encodedAccumulator = encodedAccumulator.concat(TOPIC_SEPARATOR)
        encodedAccumulator = encodedAccumulator.concat(encodedTopic)
      } else {
        console.log(
          `Unable to encode snapshot comment: survey is bigger than ${MAX_CHARS_IN_SNAPSHOT_REASON} chars. Survey: ${survey}`
        ) //TODO: report error
      }
    })
    return encodedAccumulator
  }
}
