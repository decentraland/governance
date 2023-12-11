import crypto from 'crypto'

import EventModel, { EventType, ProposalCreatedEvent } from '../models/Event'

export class EventsService {
  static async getLatest() {
    return await EventModel.getLatest()
  }

  static async proposalCreated(proposal_id: string, proposal_title: string, address: string) {
    const proposalCreatedEvent: ProposalCreatedEvent = {
      id: crypto.randomUUID(),
      address,
      event_type: EventType.ProposalCreated,
      event_data: { proposal_id, proposal_title },
      created_at: new Date(),
    }
    await EventModel.create(proposalCreatedEvent)
  }
}
