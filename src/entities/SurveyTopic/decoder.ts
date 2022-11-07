import { ReactionType, Survey, SurveyTopicAttributes, TopicFeedback } from './types'
import { TOPIC_REACTION_CONCAT, TOPIC_SEPARATOR } from './utils'

export class SurveyDecoder {
  private topics: Pick<SurveyTopicAttributes, 'topic_id' | 'label'>[]

  constructor(topics: Pick<SurveyTopicAttributes, 'topic_id' | 'label'>[]) {
    this.topics = topics
  }

  public decode(encodedSurvey?: string): Survey {
    if (!encodedSurvey || encodedSurvey.length < 1) return []
    let buffer = encodedSurvey
    let lastTopic = false
    const survey: Survey = []
    while (!lastTopic) {
      const separatorPos = buffer.indexOf(TOPIC_SEPARATOR)
      if (separatorPos === -1) lastTopic = true
      const topicFeedback = buffer.substring(0, lastTopic ? buffer.length : separatorPos)
      survey.push(this.parseTopic(topicFeedback))
      buffer = buffer.substring(separatorPos + 1, buffer.length)
    }

    return survey
  }

  private parseTopic(topicFeedback: string): TopicFeedback {
    const topicId = topicFeedback.substring(0, topicFeedback.indexOf(TOPIC_REACTION_CONCAT))
    const reaction = topicFeedback.substring(topicFeedback.indexOf(TOPIC_REACTION_CONCAT) + 1, topicFeedback.length)

    const topic = this.topics.find((topic) => topic.topic_id === topicId)
    if (!topic) {
      throw new Error(`Unable to parse topic feedback ${topicFeedback}`)
    }
    return {
      topic: { topic_id: topic.topic_id, label: topic.label },
      reaction: SurveyDecoder.getReaction(reaction),
    }
  }

  private static getReaction(reaction: string) {
    if (SurveyDecoder.isReactionType(reaction)) return reaction as ReactionType
    else throw new Error(`Unable to parse reaction ${reaction}`)
  }

  private static isReactionType(value: string | null | undefined): boolean {
    switch (value) {
      case ReactionType.EMPTY:
      case ReactionType.HAPPY:
      case ReactionType.INDIFFERENT:
      case ReactionType.ANGRY:
        return true
      default:
        return false
    }
  }
}
