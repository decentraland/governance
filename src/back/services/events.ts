import crypto from 'crypto'

import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import UserModel from '../../entities/User/model'
import { UserAttributes } from '../../entities/User/types'
import { DISCOURSE_USER } from '../../entities/User/utils'
import { addressShortener } from '../../helpers'
import CacheService, { TTL_1_HS } from '../../services/CacheService'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { DiscourseWebhookPost } from '../../shared/types/discourse'
import {
  ActivityTickerEvent,
  CommentedEvent,
  EventType,
  ProposalCreatedEvent,
  UpdateCreatedEvent,
  VotedEvent,
} from '../../shared/types/events'
import { DEFAULT_AVATAR_IMAGE, getProfiles } from '../../utils/Catalyst'
import { DclProfile } from '../../utils/Catalyst/types'
import { ErrorCategory } from '../../utils/errorCategories'
import EventModel from '../models/Event'

export class EventsService {
  static async getLatest(): Promise<ActivityTickerEvent[]> {
    try {
      const latestEvents = await EventModel.getLatest()

      const addresses: string[] = latestEvents
        .map((event) => event.address)
        .filter((address) => address !== null) as string[]

      const addressesToProfile = await this.getAddressesToProfiles(addresses)

      const activityTickerEvents: ActivityTickerEvent[] = []
      for (const event of latestEvents) {
        const { address } = event
        activityTickerEvents.push(
          address
            ? {
                author: addressesToProfile[address].username || addressShortener(address),
                avatar: addressesToProfile[address].avatar,
                ...event,
              }
            : event
        )
      }

      return activityTickerEvents
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

  static async commented(discourseEventId: string, discourseEvent: string, discoursePost: DiscourseWebhookPost) {
    try {
      if (
        discourseEvent !== 'post_created' ||
        (await EventModel.isDiscourseEventRegistered(discourseEventId)) ||
        discoursePost.category_id !== DiscourseService.getCategory() ||
        discoursePost.username === DISCOURSE_USER
      ) {
        return
      }

      const commentedProposal = await ProposalModel.findOne<ProposalAttributes>({
        discourse_topic_id: discoursePost.topic_id,
      })
      if (!commentedProposal) {
        ErrorService.report('Unable to find commented proposal', {
          event_data: {
            discourse_event_id: discourseEventId,
            discourse_event: discourseEvent,
            discourse_post: discoursePost,
          },
          category: ErrorCategory.Events,
        })
        return
      }

      const user = await UserModel.findOne<UserAttributes>({ forum_id: discoursePost.user_id })

      const commentedEvent: CommentedEvent = {
        id: crypto.randomUUID(),
        address: user ? user.address : null,
        event_type: EventType.Commented,
        event_data: {
          discourse_event_id: discourseEventId,
          discourse_event: discourseEvent,
          discourse_post: discoursePost,
          proposal_id: commentedProposal.id,
          proposal_title: commentedProposal.title,
        },
        created_at: new Date(discoursePost.created_at),
      }

      return await EventModel.create(commentedEvent)
    } catch (e) {
      ErrorService.report('Unexpected error while creating comment event', { error: e, category: ErrorCategory.Events })
    }
  }
}
