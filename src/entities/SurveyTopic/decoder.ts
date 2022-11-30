import { Reaction, Survey, TopicFeedback } from './types'

const has = <K extends string>(key: K, x: object): x is { [key in K]: unknown } => key in x

function isValidTopicFeedback(rawTopicFeedback: never) {
  return (
    typeof rawTopicFeedback === 'object' &&
    rawTopicFeedback !== null &&
    has('topic_id', rawTopicFeedback) &&
    has('reaction', rawTopicFeedback)
  )
}

function isValidTopicId(rawTopic: unknown) {
  return rawTopic !== null && typeof rawTopic === 'string' && rawTopic.length > 0
}

function isReactionType(value: string | null | undefined): boolean {
  switch (value) {
    case Reaction.EMPTY:
    case Reaction.LOVE:
    case Reaction.LIKE:
    case Reaction.CONCERNED:
    case Reaction.NEUTRAL:
      return true
    default:
      return false
  }
}

function isUnique(decodedSurvey: TopicFeedback[], topicFeedback: TopicFeedback) {
  return !decodedSurvey.find((topic) => topic.topic_id === topicFeedback.topic_id)
}

export function decodeSurvey(encodedSurvey?: Record<string, unknown>): Survey {
  const decodedSurvey: Survey = []
  if (!encodedSurvey || Object.keys(encodedSurvey).length === 0) return decodedSurvey
  try {
    const rawSurvey: unknown = encodedSurvey?.survey
    if (Object.prototype.toString.call(rawSurvey) === '[object Array]') {
      const arraySurvey = rawSurvey as []
      arraySurvey.forEach((rawTopicFeedback) => {
        if (isValidTopicFeedback(rawTopicFeedback)) {
          const topicFeedback = rawTopicFeedback as TopicFeedback
          if (
            isValidTopicId(topicFeedback.topic_id) &&
            isReactionType(topicFeedback.reaction) &&
            isUnique(decodedSurvey, topicFeedback)
          )
            decodedSurvey.push(topicFeedback)
        }
      })
    }
    return decodedSurvey
  } catch (e) {
    console.log(`Unable to parse encoded survey ${encodedSurvey}`)
    return decodedSurvey
  }
}
