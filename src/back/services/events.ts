import crypto from 'crypto'
import { ethers } from 'ethers'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { SNAPSHOT_SPACE } from '../../entities/Snapshot/constants'
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
  AlchemyBlock,
  AlchemyLog,
  CommentedEvent,
  DelegationClearEvent,
  DelegationSetEvent,
  EventType,
  ProposalCreatedEvent,
  UpdateCreatedEvent,
  VotedEvent,
} from '../../shared/types/events'
import { DEFAULT_AVATAR_IMAGE, getProfiles } from '../../utils/Catalyst'
import { DclProfile } from '../../utils/Catalyst/types'
import { ErrorCategory } from '../../utils/errorCategories'
import EventModel from '../models/Event'

const CLEAR_DELEGATE_SIGNATURE_HASH = '0x9c4f00c4291262731946e308dc2979a56bd22cce8f95906b975065e96cd5a064'
const SET_DELEGATE_SIGNATURE_HASH = '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e'

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

  static async delegationSet(new_delegate: string, delegator: string, transaction_hash: string, created_at: Date) {
    try {
      const delegationSetEvent: DelegationSetEvent = {
        id: crypto.randomUUID(),
        address: delegator,
        event_type: EventType.DelegationSet,
        event_data: { new_delegate, transaction_hash },
        created_at,
      }
      await EventModel.create(delegationSetEvent)
    } catch (error) {
      this.reportEventError(error as Error, EventType.DelegationSet, { delegator, new_delegate })
    }
  }

  static async delegationClear(
    removed_delegate: string,
    delegator: string,
    transaction_hash: string,
    created_at: Date
  ) {
    try {
      const delegationClearEvent: DelegationClearEvent = {
        id: crypto.randomUUID(),
        address: delegator,
        event_type: EventType.DelegationClear,
        event_data: { removed_delegate, transaction_hash },
        created_at,
      }
      await EventModel.create(delegationClearEvent)
    } catch (error) {
      this.reportEventError(error as Error, EventType.DelegationClear, { delegator, removed_delegate })
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
        const isAnUpdateTopic = /Update #\d+/.test(discoursePost.topic_title)
        if (!isAnUpdateTopic) {
          ErrorService.report('Unable to find commented proposal', {
            event_data: {
              discourse_event_id: discourseEventId,
              discourse_event: discourseEvent,
              discourse_post: discoursePost,
            },
            category: ErrorCategory.Events,
          })
        }
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

  static async delegationUpdate(block: AlchemyBlock) {
    const blockTimestamp = block.timestamp
    for (const transaction of block.transactions) {
      const txHash = transaction.hash
      if (await EventModel.isDelegationTxRegistered(txHash)) {
        continue
      }
      for (const log of transaction.logs) {
        const { spaceId, methodSignature, delegator, delegate } = this.decodeLogTopics(log.topics)
        if (spaceId !== SNAPSHOT_SPACE) {
          continue
        }
        const creationDate = this.getContractEventDate(blockTimestamp, log)
        if (methodSignature === CLEAR_DELEGATE_SIGNATURE_HASH) {
          await this.delegationClear(delegate, delegator, txHash, creationDate)
        }
        if (methodSignature === SET_DELEGATE_SIGNATURE_HASH) {
          await this.delegationSet(delegate, delegator, txHash, creationDate)
        }
      }
    }
  }

  private static decodeLogTopics(topics: string[]) {
    const methodSignature = topics[0]
    const delegator = this.decodeTopicToAddress(topics[1])
    const spaceId = ethers.utils.parseBytes32String(topics[2])
    const delegate = this.decodeTopicToAddress(topics[3])
    return { spaceId, methodSignature, delegator, delegate }
  }

  /**
   * This is so each log event is chronologically ordered, and has the closest date
   * to the block timestamp
   */
  private static getContractEventDate(blockTimestamp: number, log: AlchemyLog) {
    return new Date(blockTimestamp * 1000 + log.index)
  }

  private static decodeTopicToAddress(topic: string) {
    const address = '0x' + topic.slice(topic.length - 40)
    if (!isEthereumAddress(address)) {
      throw new Error('Decoded string is not a valid address')
    }
    return address
  }
}
