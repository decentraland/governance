export enum Reaction {
  LOVE = 'love',
  LIKE = 'like',
  NEUTRAL = 'neutral',
  CONCERNED = 'concerned',
  EMPTY = 'empty',
}

export type SurveyTopicAttributes = {
  id: string
  topic_id: string
  created_at: Date
  updated_at: Date
}

export type TopicFeedback = Topic & {
  reaction: Reaction
}

export type Survey = TopicFeedback[]

export type Topic = Pick<SurveyTopicAttributes, 'topic_id'>
