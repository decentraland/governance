import { DiscourseWebhookPost } from './discourse'

export type CommonEventAttributes = {
  id: string
  address: string | null
  created_at: Date
}

type VoteEventData = { choice: string } & ProposalEventData

export type ProposalEventData = { proposal_id: string; proposal_title: string }

type UpdateCreatedEventData = {
  update_id: string
} & ProposalEventData

type DiscourseEventData = {
  discourse_event_id: string
  discourse_event: string
  discourse_post: DiscourseWebhookPost
}

export type CommentedEventData = DiscourseEventData & ProposalEventData

type DelegationSetData = {
  new_delegate: string | null
  transaction_hash: string
}

type DelegationClearData = {
  removed_delegate: string | null
  transaction_hash: string
}

export enum EventType {
  Voted = 'voted',
  ProposalCreated = 'proposal_created',
  UpdateCreated = 'update_created',
  Commented = 'commented',
  DelegationSet = 'delegation_set',
  DelegationClear = 'delegation_clear',
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

export type DelegationSetEvent = {
  event_type: EventType.DelegationSet
  event_data: DelegationSetData
} & CommonEventAttributes

export type DelegationClearEvent = {
  event_type: EventType.DelegationClear
  event_data: DelegationClearData
} & CommonEventAttributes

export type Event =
  | VotedEvent
  | ProposalCreatedEvent
  | UpdateCreatedEvent
  | CommentedEvent
  | DelegationSetEvent
  | DelegationClearEvent

export type ActivityTickerEvent = {
  author?: string
  avatar?: string
} & Event

export type AlchemyBlock = {
  hash: string
  number: number
  timestamp: number
  transactions: AlchemyTransaction[]
}

export type AlchemyLog = {
  index: number
  topics: string[]
  data: string
  transaction: AlchemyTransaction
}

export type AlchemyTransaction = {
  hash: string
  nonce: number
  index: number
  from: {
    address: string
  }
  logs: AlchemyLog[]
}
