import crypto from 'crypto'
import { ethers } from 'ethers'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { DELEGATION_REGISTRY_ENFORCED } from '../constants'
import ProposalModel from '../entities/Proposal/model'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import { ProposalAttributes } from '../entities/Proposal/types'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { isSameAddress } from '../entities/Snapshot/utils'
import UpdateModel from '../entities/Updates/model'
import { UpdateAttributes } from '../entities/Updates/types'
import UserModel from '../entities/User/model'
import { UserAttributes } from '../entities/User/types'
import { DISCOURSE_USER } from '../entities/User/utils'
import { addressShortener } from '../helpers'
import EventModel from '../models/Event'
import type { Project } from '../models/Project'
import CacheService, { TTL_1_HS } from '../services/CacheService'
import { DiscourseService } from '../services/DiscourseService'
import { ErrorService } from '../services/ErrorService'
import { DiscourseWebhookPost } from '../shared/types/discourse'
import {
  ActivityTickerEvent,
  AlchemyBlock,
  AlchemyLog,
  DelegationClearEvent,
  DelegationSetEvent,
  EventFilter,
  EventType,
  ProjectUpdateCommentedEvent,
  ProposalCommentedEvent,
  ProposalCreatedEvent,
  ProposalFinishedEvent,
  UpdateCreatedEvent,
  VestingCreatedEvent,
  VotedEvent,
} from '../shared/types/events'
import { DEFAULT_AVATAR_IMAGE, getProfiles } from '../utils/Catalyst'
import { DclProfile } from '../utils/Catalyst/types'
import Time from '../utils/date/Time'
import { ErrorCategory } from '../utils/errorCategories'

import { SnapshotService } from './SnapshotService'
import { NotificationService } from './notification'

const CLEAR_DELEGATE_SIGNATURE_HASH = '0x9c4f00c4291262731946e308dc2979a56bd22cce8f95906b975065e96cd5a064'
const SET_DELEGATE_SIGNATURE_HASH = '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e'
// Snapshot's DelegateRegistry is deployed at the same address on every supported chain.
const SNAPSHOT_DELEGATION_REGISTRY = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'

export class EventsService {
  static async getLatest(filters: EventFilter): Promise<ActivityTickerEvent[]> {
    try {
      const latestEvents = await EventModel.getLatest(filters)

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
                avatar: addressesToProfile[address].avatarUrl,
                ...event,
              }
            : event
        )
      }

      return activityTickerEvents
    } catch (error) {
      ErrorService.report('Error fetching events', { error: `${error}`, category: ErrorCategory.Events })
      return []
    }
  }

  public static async getAll() {
    return await EventModel.getAll()
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
        acc[address] = { address, avatarUrl: DEFAULT_AVATAR_IMAGE, username: null, hasCustomAvatar: false }
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

  static async voted(proposal_id: string, choice: string, address: string) {
    try {
      const proposalRow = await ProposalModel.findOne<ProposalAttributes>({ id: proposal_id, deleted: false })
      if (!proposalRow) {
        throw new Error(`Proposal not found: "${proposal_id}"`)
      }
      const proposal = ProposalModel.parse(proposalRow)

      // Confirm on Snapshot that this address actually voted on the proposal before
      // recording the activity event, so "voted" entries cannot be fabricated.
      const votes = await SnapshotService.getVotesByProposal(proposal.snapshot_id)
      const userVote = votes.find((vote) => isSameAddress(vote.voter, address))
      if (!userVote) {
        throw new Error(`No Snapshot vote found for ${address} on proposal "${proposal_id}"`)
      }

      // Derive the choice label from the proposal's own choices via the vote's choice index
      // so no client-supplied free text is stored (prevents feed spoofing / stored XSS).
      const choices: string[] = proposal.snapshot_proposal?.choices || []
      const derivedChoice = typeof userVote.choice === 'number' ? choices[userVote.choice - 1] : undefined
      const safeChoice = derivedChoice ?? (choices.includes(choice) ? choice : 'unknown')

      const votedEvent: VotedEvent = {
        id: crypto.randomUUID(),
        address,
        event_type: EventType.Voted,
        event_data: { proposal_id, proposal_title: proposal.title, choice: safeChoice },
        created_at: new Date(),
      }
      await EventModel.create(votedEvent)
      NotificationService.newVote(proposal_id, address)
    } catch (error) {
      this.reportEventError(error as Error, EventType.Voted, { address, proposal_id, choice })
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

      const isUpdateTopic = /Update #\d+/.test(discoursePost.topic_title)
      const user = await UserModel.findOne<UserAttributes>({ forum_id: discoursePost.user_id })
      if (isUpdateTopic) {
        return await this.commentedOnProjectUpdate(discoursePost, discourseEventId, discourseEvent, user)
      }
      return await this.commentedOnProposal(discoursePost, discourseEventId, discourseEvent, user)
    } catch (e) {
      ErrorService.report('Unexpected error while creating comment event', { error: e, category: ErrorCategory.Events })
    }
  }

  private static async commentedOnProposal(
    discoursePost: DiscourseWebhookPost,
    discourseEventId: string,
    discourseEvent: string,
    user: UserAttributes | undefined
  ) {
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
    const commentedEvent: ProposalCommentedEvent = {
      id: crypto.randomUUID(),
      address: user ? user.address : null,
      event_type: EventType.ProposalCommented,
      event_data: {
        discourse_event_id: discourseEventId,
        discourse_event: discourseEvent,
        discourse_post: discoursePost,
        proposal_id: commentedProposal.id,
        proposal_title: commentedProposal.title,
      },
      created_at: new Date(discoursePost.created_at),
    }

    const commentEvent = await EventModel.create(commentedEvent)
    NotificationService.newCommentOnProposal(commentEvent)
    return commentEvent
  }

  private static async commentedOnProjectUpdate(
    discoursePost: DiscourseWebhookPost,
    discourseEventId: string,
    discourseEvent: string,
    user: UserAttributes | undefined
  ) {
    const commentedUpdate = await UpdateModel.findOne<UpdateAttributes>({
      discourse_topic_id: discoursePost.topic_id,
    })
    if (!commentedUpdate) {
      ErrorService.report('Unable to find commented update', {
        event_data: {
          discourse_event_id: discourseEventId,
          discourse_event: discourseEvent,
          discourse_post: discoursePost,
        },
        category: ErrorCategory.Events,
      })
      return
    }
    const commentedProposal = await ProposalModel.findOne<ProposalAttributes>({
      id: commentedUpdate?.proposal_id,
    })
    if (!commentedProposal) {
      ErrorService.report('Unable to find proposal for commented update', {
        event_data: {
          discourse_event_id: discourseEventId,
          discourse_event: discourseEvent,
          discourse_post: discoursePost,
        },
        commentedUpdate,
        category: ErrorCategory.Events,
      })
      return
    }
    const commentedEvent: ProjectUpdateCommentedEvent = {
      id: crypto.randomUUID(),
      address: user ? user.address : null,
      event_type: EventType.ProjectUpdateCommented,
      event_data: {
        discourse_event_id: discourseEventId,
        discourse_event: discourseEvent,
        discourse_post: discoursePost,
        proposal_id: commentedUpdate.proposal_id,
        proposal_title: commentedProposal.title,
        update_id: commentedUpdate.id,
      },
      created_at: new Date(discoursePost.created_at),
    }

    await EventModel.create(commentedEvent)
    NotificationService.newCommentOnProjectUpdate(commentedEvent)
    return commentedEvent
  }

  static async delegationUpdate(block: AlchemyBlock) {
    const blockTimestamp = block.timestamp
    for (const transaction of block.transactions) {
      const txHash = transaction.hash
      if (await EventModel.isDelegationTxRegistered(txHash)) {
        continue
      }
      for (const log of transaction.logs) {
        // Match the event signature (and topic arity) BEFORE decoding. An unrelated or
        // malformed log must be skipped, not throw: decodeLogTopics throws on a short topic
        // array or a non-address topic, and an uncaught throw here aborts the whole block so
        // Alchemy re-delivers it indefinitely, wedging every legitimate delegation in it.
        // Guard the array shape first so reading topics[0] on a malformed payload cannot throw.
        if (!Array.isArray(log.topics) || log.topics.length < 4) {
          continue
        }
        const methodSignature = log.topics[0]
        if (methodSignature !== SET_DELEGATE_SIGNATURE_HASH && methodSignature !== CLEAR_DELEGATE_SIGNATURE_HASH) {
          continue
        }
        // The HMAC proves the payload is from Alchemy, not which contract emitted the log.
        const emitter = log.account?.address
        const emitterIsRegistry = !!emitter && isSameAddress(emitter, SNAPSHOT_DELEGATION_REGISTRY)
        if (DELEGATION_REGISTRY_ENFORCED) {
          if (!emitterIsRegistry) continue // fail-closed: require the registry emitter
        } else if (emitter && !emitterIsRegistry) {
          continue // best-effort: reject a mismatching emitter, tolerate a missing one
        }
        let decoded
        try {
          decoded = this.decodeLogTopics(log.topics)
        } catch {
          continue
        }
        const { spaceId, delegator, delegate } = decoded
        if (spaceId !== SNAPSHOT_SPACE) {
          continue
        }
        // The real registry rejects self-delegation, so a delegator === delegate log can only be
        // forged; drop it rather than record a nonsensical feed entry.
        if (isSameAddress(delegator, delegate)) {
          continue
        }
        const creationDate = this.getContractEventDate(blockTimestamp, log)
        if (methodSignature === CLEAR_DELEGATE_SIGNATURE_HASH) {
          await this.delegationClear(delegate, delegator, txHash, creationDate)
        } else {
          await this.delegationSet(delegate, delegator, txHash, creationDate)
        }
      }
    }
  }

  static async proposalFinished(proposalsWithOutcome: ProposalWithOutcome[]) {
    for (const proposal of proposalsWithOutcome) {
      const { id, title, newStatus, finish_at, user } = proposal
      const finishEvent: ProposalFinishedEvent = {
        id: crypto.randomUUID(),
        address: user,
        event_type: EventType.ProposalFinished,
        event_data: { proposal_id: id, proposal_title: title, new_status: newStatus },
        created_at: new Date(finish_at),
      }
      await EventModel.create(finishEvent)
    }
  }

  static async projectEnacted(project: Project) {
    const { author, id, proposal_id, funding } = project
    if (!funding || !funding.vesting) {
      ErrorService.report('Project enacted without vesting', { project_id: id, category: ErrorCategory.Events })
      return
    }
    const { years, months, days } = Time(funding.vesting.finish_at).preciseDiff(Time(funding.vesting.start_at), true)
    const vestingEvent: VestingCreatedEvent = {
      id: crypto.randomUUID(),
      address: author,
      event_type: EventType.VestingCreated,
      event_data: {
        proposal_id,
        proposal_title: project.title,
        vesting_address: funding.vesting.address,
        amount: funding.vesting.total,
        duration_in_months: years * 12 + months + (days > 0 ? 1 : 0),
      },
      created_at: funding.enacted_at ? new Date(funding.enacted_at) : new Date(),
    }
    await EventModel.create(vestingEvent)
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
