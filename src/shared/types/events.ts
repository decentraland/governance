import { DiscourseWebhookPost } from '../../clients/DiscourseTypes'

export type CommonEventAttributes = {
  id: string
  address: string | null
  created_at: Date
}

type VoteEventData = { choice: string } & ProposalEventData
type ProposalEventData = { proposal_id: string; proposal_title: string }
type UpdateCreatedEventData = {
  update_id: string
} & ProposalEventData
type DiscourseEventData = {
  discourse_event_id: string
  discourse_event: string
  discourse_post: DiscourseWebhookPost
}
export type CommentedEventData = DiscourseEventData & ProposalEventData

export enum EventType {
  Voted = 'voted',
  ProposalCreated = 'proposal_created',
  UpdateCreated = 'update_created',
  Commented = 'commented',
}

export type VotedEvent = {
  event_type: EventType.Voted
  event_data: VoteEventData
} & CommonEventAttributes

export type ProposalCreatedEvent = {
  event_type: EventType.ProposalCreated
  event_data: ProposalEventData
} & CommonEventAttributes

export type UpdateCreatedEvent = {
  event_type: EventType.UpdateCreated
  event_data: UpdateCreatedEventData
} & CommonEventAttributes

export type CommentedEvent = {
  event_type: EventType.Commented
  event_data: CommentedEventData
} & CommonEventAttributes

export type Event = VotedEvent | ProposalCreatedEvent | UpdateCreatedEvent | CommentedEvent

export type ActivityTickerEvent = {
  author?: string
  avatar?: string
} & Event
