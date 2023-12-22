import crypto from 'crypto'

import { addressShortener } from '../../helpers'
import CacheService, { TTL_1_HS } from '../../services/CacheService'
import { ErrorService } from '../../services/ErrorService'
import {
  EventType,
  EventWithAuthor,
  ProposalCreatedEvent,
  UpdateCreatedEvent,
  VotedEvent,
} from '../../shared/types/events'
import { DEFAULT_AVATAR_IMAGE, getProfiles } from '../../utils/Catalyst'
import { DclProfile } from '../../utils/Catalyst/types'
import { ErrorCategory } from '../../utils/errorCategories'
import EventModel from '../models/Event'

export class EventsService {
  static async getLatest(): Promise<EventWithAuthor[]> {
    try {
      const latestEvents = await EventModel.getLatest()
      const addresses = latestEvents.map((event) => event.address)

      const addressesToProfile = await this.getAddressesToProfiles(addresses)

      const latestEventsWithAuthor: EventWithAuthor[] = []
      for (const event of latestEvents) {
        const { address } = event
        latestEventsWithAuthor.push({
          author: addressesToProfile[address].username || addressShortener(address),
          avatar: addressesToProfile[address].avatar,
          ...event,
        })
      }

      return latestEventsWithAuthor
    } catch (error) {
      ErrorService.report('Error fetching events', { error, category: ErrorCategory.Events })
      return []
    }
  }

  private static async getAddressesToProfiles(addresses: string[]) {
    try {
      const profiles = await this.getProfilesWithCache(addresses)
      return profiles.reduce((acc, profile) => {
        acc[profile.address] = profile
        return acc
      }, {} as Record<string, DclProfile>)
    } catch (error) {
      ErrorService.report('Error fetching profiles', { error, category: ErrorCategory.Events })
      return addresses.reduce((acc, address) => {
        acc[address] = { address, avatar: DEFAULT_AVATAR_IMAGE, username: null, hasCustomAvatar: false }
        return acc
      }, {} as Record<string, DclProfile>)
    }
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

  static async deleteOldEvents() {
    try {
      await EventModel.deleteOldEvents()
    } catch (error) {
      ErrorService.report('Error deleting old events', { error, category: ErrorCategory.Events })
    }
  }

  private static getProfileCacheKey(address: string) {
    const cacheKey = `profile-${address.toLowerCase()}`
    return cacheKey
  }

  static async getProfilesWithCache(addresses: string[]): Promise<DclProfile[]> {
    const profiles: DclProfile[] = []
    const addressesToFetch: string[] = []

    for (const address of addresses) {
      const cachedProfile = CacheService.get<DclProfile>(this.getProfileCacheKey(address))
      if (cachedProfile) {
        profiles.push(cachedProfile)
      } else {
        addressesToFetch.push(address)
      }
    }

    if (addressesToFetch.length > 0) {
      const dclProfiles: DclProfile[] = await getProfiles(addressesToFetch)

      for (const dclProfile of dclProfiles) {
        CacheService.set(this.getProfileCacheKey(dclProfile.address), dclProfile, TTL_1_HS)
        profiles.push(dclProfile)
      }
    }

    return profiles
  }
}
