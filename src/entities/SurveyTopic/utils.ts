import { ReactionType, Survey } from './types'

type ReactionView = { reaction: ReactionType; icon: string }
export const REACTIONS_VIEW: ReactionView[] = [
  { reaction: ReactionType.LOVE, icon: '🥰' },
  { reaction: ReactionType.LIKE, icon: '😊' },
  { reaction: ReactionType.NEUTRAL, icon: '😐' },
  { reaction: ReactionType.CONCERNED, icon: '🤨' },
  { reaction: ReactionType.EMPTY, icon: '-' },
]
export const TOPIC_REACTION_CONCAT = ':'
export const TOPIC_SEPARATOR = ','
export const MAX_CHARS_IN_SNAPSHOT_REASON = 140

export class SurveyEncoder {
  static encode(survey?: Survey | null): string {
    if (!survey || survey.length < 1) return ''

    let encodedAccumulator = ''
    survey.forEach((topicFeedback, index) => {
      const topicId = topicFeedback.topic.topic_id
      if (topicId.length > 5) {
        console.log(`Survey topic id is bigger than 5 chars: ${topicId}`)
        return encodedAccumulator
      }
      const encodedReaction =
        REACTIONS_VIEW.find((reaction) => reaction.reaction === topicFeedback.reaction)?.icon || null
      if (encodedReaction === null) {
        console.log(`Couldn't find icon for reaction type: ${topicFeedback.reaction}`)
        return encodedAccumulator
      }
      const encodedTopic = topicId + TOPIC_REACTION_CONCAT + encodedReaction
      if (encodedAccumulator.length + encodedTopic.length + TOPIC_SEPARATOR.length <= MAX_CHARS_IN_SNAPSHOT_REASON) {
        if (index > 0) encodedAccumulator = encodedAccumulator.concat(TOPIC_SEPARATOR)
        encodedAccumulator = encodedAccumulator.concat(encodedTopic)
      } else {
        console.log(
          `Unable to encode snapshot comment: survey is bigger than ${MAX_CHARS_IN_SNAPSHOT_REASON} chars. Survey: ${JSON.stringify(
            survey
          )}`
        ) //TODO: report error
      }
    })
    return encodedAccumulator
  }
}
