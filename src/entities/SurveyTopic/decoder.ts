import { ReactionType, Survey, SurveyTopicAttributes, TopicFeedback } from './types'
import { REACTIONS_VIEW, TOPIC_REACTION_CONCAT, TOPIC_SEPARATOR } from './utils'

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
      const parsedTopic: TopicFeedback | null = this.parseTopicFeedback(topicFeedback)
      if (parsedTopic) survey.push(parsedTopic)
      buffer = buffer.substring(separatorPos + 1, buffer.length)
    }

    return survey
  }

  private parseTopicFeedback(topicFeedback: string): TopicFeedback | null {
    const topic = this.parseTopic(topicFeedback)
    const parsedReaction = this.parseReaction(topicFeedback)

    if (!topic || !parsedReaction) {
      return null
    }

    return {
      topic,
      reaction: parsedReaction,
    }
  }

  private parseReaction(topicFeedback: string): ReactionType | null {
    const reaction =
      topicFeedback.substring(topicFeedback.indexOf(TOPIC_REACTION_CONCAT) + 1, topicFeedback.length) || ''
    return SurveyDecoder.getReaction(reaction)
  }

  private parseTopic(topicFeedback: string): Pick<SurveyTopicAttributes, 'topic_id' | 'label'> | undefined {
    const topicId = topicFeedback.substring(0, topicFeedback.indexOf(TOPIC_REACTION_CONCAT))
    const topic = this.topics.find((topic) => topic.topic_id === topicId)
    if (!topic) console.log(`Unable to parse topic feedback ${topicFeedback}`) // TODO: report error
    return topic
  }

  private static getReaction(reaction: string): ReactionType | null {
    const foundReaction = REACTIONS_VIEW.find((reactionView) => reactionView.icon === reaction)?.reaction || null
    if (foundReaction && SurveyDecoder.isReactionType(foundReaction)) return foundReaction as ReactionType
    else {
      console.log(`Unable to parse reaction ${reaction}`) // TODO: report error
      return null
    }
  }

  private static isReactionType(value: string | null | undefined): boolean {
    switch (value) {
      case ReactionType.EMPTY:
      case ReactionType.LOVE:
      case ReactionType.LIKE:
      case ReactionType.NEUTRAL:
      case ReactionType.CONCERNED:
        return true
      default:
        return false
    }
  }
}
