import crypto from 'crypto'

import { ErrorService } from '../../services/ErrorService'
import { ErrorCategory } from '../../utils/errorCategories'
import EventModel, { EventType, ProposalCreatedEvent, UpdateCreatedEvent, VotedEvent } from '../models/Event'

export class EventsService {
  static async getLatest() {
    return await EventModel.getLatest()
  }

  static async proposalCreated(proposal_id: string, proposal_title: string, address: string) {
    try {
      const proposalCreatedEvent: ProposalCreatedEvent = {
        id: crypto.randomUUID(),
        address,
        event_type: EventType.ProposalCreated,
        event_data: { proposal_id, proposal_title },
        created_at: new Date(),
      }
      await EventModel.create(proposalCreatedEvent)
    } catch (error) {
      this.reportEventError(error as Error, EventType.ProposalCreated, { address, proposal_id, proposal_title })
    }
  }

  static async updateCreated(update_id: string, proposal_id: string, proposal_title: string, address: string) {
    try {
      const updateCreatedEvent: UpdateCreatedEvent = {
        id: crypto.randomUUID(),
        address,
        event_type: EventType.UpdateCreated,
        event_data: { update_id, proposal_id, proposal_title },
        created_at: new Date(),
      }
      await EventModel.create(updateCreatedEvent)
    } catch (error) {
      this.reportEventError(error as Error, EventType.UpdateCreated, {
        address,
        update_id,
        proposal_id,
        proposal_title,
      })
    }
  }

  static async voted(proposal_id: string, proposal_title: string, choice: string, address: string) {
    try {
      const votedEvent: VotedEvent = {
        id: crypto.randomUUID(),
        address,
        event_type: EventType.Voted,
        event_data: { proposal_id, proposal_title, choice },
        created_at: new Date(),
      }
      await EventModel.create(votedEvent)
    } catch (error) {
      this.reportEventError(error as Error, EventType.Voted, { address, proposal_id, proposal_title, choice })
    }
  }

  private static reportEventError(error: Error, eventType: EventType, args: Record<string, unknown>) {
    ErrorService.report('Error creating event', {
      error,
      event_type: eventType,
      ...args,
      category: ErrorCategory.Events,
    })
  }
}
