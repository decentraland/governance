export enum ReactionType {
  HAPPY = 'happy',
  INDIFFERENT = 'indifferent',
  ANGRY = 'angry',
  EMPTY = 'empty',
}

export type SurveyTopicAttributes = {
  id: string
  topic_id: string
  label: string
  created_at: Date
  updated_at: Date
}

export type TopicFeedback = {
  topic: Topic
  reaction: ReactionType
}

export type Survey = TopicFeedback[]

export type Topic = Pick<SurveyTopicAttributes, 'topic_id' | 'label'>
