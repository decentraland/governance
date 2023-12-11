import crypto from 'crypto'

import { getNameAndAvatar } from '../../utils/Catalyst'
import EventModel, { EventType, ProposalCreatedEvent, UpdateCreatedEvent } from '../models/Event'

export class EventsService {
  static async getLatest() {
    return await EventModel.getLatest()
  }

  //TODO: error handling
  static async proposalCreated(proposal_id: string, proposal_title: string, address: string) {
    const { displayableUser } = await getNameAndAvatar(address)

    const proposalCreatedEvent: ProposalCreatedEvent = {
      id: crypto.randomUUID(),
      address,
      username: displayableUser !== address ? displayableUser : undefined,
      event_type: EventType.ProposalCreated,
      event_data: { proposal_id, proposal_title },
      created_at: new Date(),
    }
    await EventModel.create(proposalCreatedEvent)
  }

  //TODO: error handling
  static async updateCreated(update_id: string, proposal_id: string, proposal_title: string, address: string) {
    try {
      const { displayableUser } = await getNameAndAvatar(address)

      const updateCreatedEvent: UpdateCreatedEvent = {
        id: crypto.randomUUID(),
        username: displayableUser !== address ? displayableUser : undefined,
        address,
        event_type: EventType.UpdateCreated,
        event_data: { update_id, proposal_id, proposal_title },
        created_at: new Date(),
      }
      await EventModel.create(updateCreatedEvent)
    } catch (error) {
      console.log('error creating event', error)
    }
  }
}
