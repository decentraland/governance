import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

export type CommonEventAttributes = {
  id: string
  address: string
  username?: string
  created_at: Date
}

export enum EventType {
  Voted = 'voted',
  ProposalCreated = 'proposal_created',
  UpdateCreated = 'update_created',
  Commented = 'commented',
}

export type Event = VoteEvent | ProposalCreatedEvent | UpdateCreatedEvent | CommentedEvent

type VoteEvent = {
  event_type: EventType.Voted
  event_data: VoteEventData
} & CommonEventAttributes

type ProposalCreatedEvent = {
  event_type: EventType.ProposalCreated
  event_data: ProposalEventData
} & CommonEventAttributes

type UpdateCreatedEvent = {
  event_type: EventType.UpdateCreated
  event_data: UpdateCreatedEventData
} & CommonEventAttributes

type CommentedEvent = {
  event_type: EventType.Commented
  event_data: ProposalEventData
} & CommonEventAttributes

type VoteEventData = { choice: string } & ProposalEventData
type ProposalEventData = { proposal_id: string; proposal_title: string }
type UpdateCreatedEventData = {
  update_id: string
} & ProposalEventData

export default class EventModel extends Model<Event> {
  static tableName = 'events'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getLatest(): Promise<Event[]> {
    const query = SQL`
      SELECT *
      FROM ${table(EventModel)}
      WHERE created_at > NOW() - INTERVAL '7 day'
      ORDER BY created_at DESC
    `
    const result = await this.namedQuery<Event>('get_latest_events', query)
    return result
  }
}
