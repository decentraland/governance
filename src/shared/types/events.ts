import { z } from 'zod'

import { ProposalStatus } from '../../entities/Proposal/types'

import { DiscourseWebhookPost } from './discourse'

export type CommonEventAttributes = {
  id: string
  address: string | null
  created_at: Date
}

type VoteEventData = { choice: string } & ProposalEventData

export type ProposalEventData = { proposal_id: string; proposal_title: string }
export type UpdateEventData = { update_id: string }

type UpdateCreatedEventData = {
  update_id: string
} & ProposalEventData

export type DiscourseEventData = {
  discourse_event_id: string
  discourse_event: string
  discourse_post: DiscourseWebhookPost
}

export type ProposalCommentedEventData = DiscourseEventData & ProposalEventData
export type UpdateCommentedEventData = DiscourseEventData & UpdateEventData & ProposalEventData

export type ProposalFinishedEventData = ProposalEventData & {
  new_status: ProposalStatus
}

export type VestingCreatedEventData = ProposalEventData & {
  vesting_address: string
  amount: number
  duration_in_months: number
}

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
  ProposalFinished = 'proposal_finished',
  UpdateCreated = 'update_created',
  ProposalCommented = 'proposal_commented',
  ProjectUpdateCommented = 'project_update_commented',
  DelegationSet = 'delegation_set',
  DelegationClear = 'delegation_clear',
  VestingCreated = 'vesting_created',
}

export const EventFilterSchema = z.object({
  event_type: z.nativeEnum(EventType).array().optional(),
  proposal_id: z.string().uuid().optional(),
  with_interval: z.boolean().optional(),
})

export type EventFilter = z.infer<typeof EventFilterSchema>

export type VotedEvent = {
  event_type: EventType.Voted
  event_data: VoteEventData
} & CommonEventAttributes

export type ProposalCreatedEvent = {
  event_type: EventType.ProposalCreated
  event_data: ProposalEventData
} & CommonEventAttributes

export type ProposalFinishedEvent = {
  event_type: EventType.ProposalFinished
  event_data: ProposalFinishedEventData
} & CommonEventAttributes

export type VestingCreatedEvent = {
  event_type: EventType.VestingCreated
  event_data: VestingCreatedEventData
} & CommonEventAttributes

export type UpdateCreatedEvent = {
  event_type: EventType.UpdateCreated
  event_data: UpdateCreatedEventData
} & CommonEventAttributes

export type ProposalCommentedEvent = {
  event_type: EventType.ProposalCommented
  event_data: ProposalCommentedEventData
} & CommonEventAttributes

export type ProjectUpdateCommentedEvent = {
  event_type: EventType.ProjectUpdateCommented
  event_data: UpdateCommentedEventData
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
  | ProposalCommentedEvent
  | ProjectUpdateCommentedEvent
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
