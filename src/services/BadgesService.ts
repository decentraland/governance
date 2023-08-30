import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { v1 as uuid } from 'uuid'

import AirdropJobModel, { AirdropJobStatus, AirdropOutcome } from '../back/models/AirdropJob'
import { VoteService } from '../back/services/vote'
import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import {
  LAND_OWNER_BADGE_SPEC_CID,
  LEGISLATOR_BADGE_SPEC_CID,
  TOP_VOTERS_IMG_URL,
  TOP_VOTERS_PER_MONTH,
} from '../constants'
import { storeBadgeSpec } from '../entities/Badges/storeBadgeSpec'
import {
  ActionResult,
  ActionStatus,
  Badge,
  BadgeStatus,
  BadgeStatusReason,
  OtterspaceRevokeReason,
  UserBadges,
  toBadgeStatus,
} from '../entities/Badges/types'
import {
  airdrop,
  createSpec,
  getLandOwnerAddresses,
  getTopVoterBadgeTitle,
  reinstateBadge,
  revokeBadge,
  trimOtterspaceId,
} from '../entities/Badges/utils'
import CoauthorModel from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress, isSameAddress } from '../entities/Snapshot/utils'
import { inBackground } from '../helpers'
import Time from '../utils/date/Time'
import { getPreviousMonthStartAndEnd } from '../utils/date/getPreviousMonthStartAndEnd'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorService } from './ErrorService'

const TRANSACTION_UNDERPRICED_ERROR_CODE = -32000

enum ErrorReason {
  NoUserWithoutBadge = 'All recipients already have this badge',
  NoUserHasVoted = 'Recipients have never voted',
  InvalidBadgeId = 'Invalid badge ID',
}

export class BadgesService {
  public static async getBadges(address: string): Promise<UserBadges> {
    const otterspaceBadges: OtterspaceBadge[] = await OtterspaceSubgraph.get().getBadgesForAddress(address)
    return this.createBadgesList(otterspaceBadges)
  }

  private static createBadgesList(otterspaceBadges: OtterspaceBadge[]): UserBadges {
    const currentBadges: Badge[] = []
    const expiredBadges: Badge[] = []
    for (const otterspaceBadge of otterspaceBadges) {
      try {
        const status = toBadgeStatus(otterspaceBadge.status)
        if (status !== BadgeStatus.Burned) {
          if (otterspaceBadge.spec.metadata) {
            const { name, description, image } = otterspaceBadge.spec.metadata
            const badge = {
              name,
              description,
              status,
              image: BadgesService.getIpfsHttpsLink(image),
              createdAt: otterspaceBadge.createdAt,
            }
            if (this.badgeExpired(status, otterspaceBadge.statusReason)) {
              expiredBadges.push(badge)
            } else {
              currentBadges.push(badge)
            }
          }
        }
      } catch (error) {
        ErrorService.report('Error parsing badge', {
          error,
          badge: otterspaceBadge,
          category: ErrorCategory.Badges,
        })
      }
    }

    return { currentBadges, expiredBadges, total: currentBadges.length + expiredBadges.length }
  }

  private static badgeExpired(status: BadgeStatus, statusReason: string) {
    return status === BadgeStatus.Revoked && statusReason === BadgeStatusReason.TenureEnded
  }

  private static getIpfsHttpsLink(ipfsLink: string) {
    return ipfsLink.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }

  public static async giveBadgeToUsers(badgeCid: string, users: string[]): Promise<AirdropOutcome> {
    try {
      const { usersWithoutBadge, usersWithBadgesToReinstate } = await this.getUsersWithoutBadge(badgeCid, users)
      if (usersWithBadgesToReinstate.length > 0) {
        inBackground(async () => {
          return await this.reinstateBadge(badgeCid, usersWithBadgesToReinstate)
        })
      }

      if (usersWithoutBadge.length === 0) {
        return { status: AirdropJobStatus.FAILED, error: ErrorReason.NoUserWithoutBadge }
      }
      const usersWhoVoted = await this.getUsersWhoVoted(usersWithoutBadge)
      if (usersWhoVoted.length === 0) {
        return { status: AirdropJobStatus.FAILED, error: ErrorReason.NoUserHasVoted }
      }
      return await this.airdropWithRetry(badgeCid, usersWhoVoted)
    } catch (e) {
      return { status: AirdropJobStatus.FAILED, error: JSON.stringify(e) }
    }
  }

  private static async getUsersWhoVoted(usersWithoutBadge: string[]) {
    const votesFromUsers = await SnapshotGraphql.get().getAddressesVotes(usersWithoutBadge)
    return Array.from(new Set(votesFromUsers.map((vote) => vote.voter.toLowerCase())))
  }

  private static async getUsersWithoutBadge(badgeCid: string, users: string[]) {
    const badges = await OtterspaceSubgraph.get().getBadges(badgeCid)
    const usersWithBadgesToReinstate: string[] = []
    const usersWithoutBadge: string[] = []

    for (const user of users) {
      const userBadge = badges.find((badge) => isSameAddress(user, badge.owner?.id))
      if (!userBadge) {
        usersWithoutBadge.push(user)
        continue
      }
      if (userBadge.status === BadgeStatus.Revoked && userBadge.statusReason === BadgeStatusReason.TenureEnded) {
        usersWithBadgesToReinstate.push(user)
      }
    }

    return {
      usersWithoutBadge,
      usersWithBadgesToReinstate,
    }
  }

  // TODO: move to contract interactions utils
  private static async airdropWithRetry(
    badgeCid: string,
    recipients: string[],
    retries = 3,
    pumpGas = false
  ): Promise<AirdropOutcome> {
    try {
      await airdrop(badgeCid, recipients, pumpGas)
      return { status: AirdropJobStatus.FINISHED, error: '' }
    } catch (error: any) {
      if (retries > 0) {
        logger.log(`Retrying airdrop... Attempts left: ${retries}`, error)
        const pumpGas = this.isTransactionUnderpricedError(error)
        return await this.airdropWithRetry(badgeCid, recipients, retries - 1, pumpGas)
      } else {
        logger.error('Airdrop failed after maximum retries', error)
        return { status: AirdropJobStatus.FAILED, error: JSON.stringify(error) }
      }
    }
  }

  // TODO: move to contract interactions utils
  private static isTransactionUnderpricedError(error: any) {
    try {
      const errorParsed = JSON.parse(error.body)
      const errorCode = errorParsed?.error?.code
      return errorCode === TRANSACTION_UNDERPRICED_ERROR_CODE
    } catch (e) {
      return false
    }
  }

  static async giveLegislatorBadges(acceptedProposals: ProposalAttributes[]) {
    const governanceProposals = acceptedProposals.filter((proposal) => proposal.type === ProposalType.Governance)
    const coauthors = await CoauthorModel.findAllByProposals(governanceProposals, CoauthorStatus.APPROVED)
    const authors = governanceProposals.map((proposal) => proposal.user)
    const authorsAndCoauthors = new Set([...authors.map(getChecksumAddress), ...coauthors.map(getChecksumAddress)])
    const recipients = Array.from(authorsAndCoauthors)
    if (!LEGISLATOR_BADGE_SPEC_CID || LEGISLATOR_BADGE_SPEC_CID.length === 0) {
      ErrorService.report('Unable to create AirdropJob. LEGISLATOR_BADGE_SPEC_CID missing.', {
        category: ErrorCategory.Badges,
        recipients,
      })
      return
    }
    await this.queueAirdropJob(LEGISLATOR_BADGE_SPEC_CID, recipients)
  }

  static async giveAndRevokeLandOwnerBadges() {
    const landOwnerAddresses = await getLandOwnerAddresses()
    const { status, error } = await BadgesService.giveBadgeToUsers(LAND_OWNER_BADGE_SPEC_CID, landOwnerAddresses)
    if (
      status === AirdropJobStatus.FAILED &&
      error !== ErrorReason.NoUserWithoutBadge &&
      error !== ErrorReason.NoUserHasVoted
    ) {
      console.error('Unable to give LandOwner badges', error)

      ErrorService.report('Unable to give LandOwner badges', {
        category: ErrorCategory.Badges,
        error,
      })
    }

    const badges = await OtterspaceSubgraph.get().getBadges(LAND_OWNER_BADGE_SPEC_CID)
    const landOwnerAddressesSet = new Set(landOwnerAddresses)

    const addressesToRevoke = badges
      .filter(
        (badge) =>
          (badge.status === BadgeStatus.Minted || badge.status === BadgeStatus.Reinstated) &&
          !landOwnerAddressesSet.has(badge.owner?.id?.toLowerCase() || '')
      )
      .map((badge) => badge.owner!.id)

    const revocationResults = await BadgesService.revokeBadge(LAND_OWNER_BADGE_SPEC_CID, addressesToRevoke)
    const failedRevocations = revocationResults.filter((result) => result.status === ActionStatus.Failed)
    if (failedRevocations.length > 0) {
      console.error('Unable to revoke LandOwner badges', failedRevocations)
      ErrorService.report('Unable to revoke LandOwner badges', {
        category: ErrorCategory.Badges,
        failedRevocations,
      })
    }
  }

  private static async queueAirdropJob(badgeSpec: string, recipients: string[]) {
    logger.log(`Enqueueing airdrop job`, { badgeSpec, recipients })
    try {
      await AirdropJobModel.create({ id: uuid(), badge_spec: badgeSpec, recipients })
    } catch (error) {
      ErrorService.report('Unable to create AirdropJob', {
        error,
        category: ErrorCategory.Badges,
        badgeSpec,
        recipients,
      })
    }
  }

  private static async performBadgeAction(
    badgeCid: string,
    addresses: string[],
    action: (badgeId: string) => Promise<void>
  ) {
    const badgeOwnerships = await OtterspaceSubgraph.get().getRecipientsBadgeIds(badgeCid, addresses)
    if (!badgeOwnerships || badgeOwnerships.length === 0) {
      return []
    }

    const actionResults = await Promise.all<ActionResult>(
      badgeOwnerships.map(async (badgeOwnership) => {
        const trimmedId = trimOtterspaceId(badgeOwnership.id)

        if (trimmedId === '') {
          return {
            status: ActionStatus.Failed,
            address: badgeOwnership.address,
            badgeId: badgeOwnership.id,
            error: ErrorReason.InvalidBadgeId,
          }
        }

        try {
          await action(trimmedId)
          return {
            status: ActionStatus.Success,
            address: badgeOwnership.address,
            badgeId: trimmedId,
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        } catch (error: any) {
          return {
            status: ActionStatus.Failed,
            address: badgeOwnership.address,
            badgeId: trimmedId,
            error: JSON.stringify(error?.reason || error),
          }
        }
      })
    )

    return actionResults
  }

  static async revokeBadge(
    badgeCid: string,
    addresses: string[],
    reason = OtterspaceRevokeReason.TenureEnded
  ): Promise<ActionResult[]> {
    return await this.performBadgeAction(badgeCid, addresses, async (badgeId) => {
      await revokeBadge(badgeId, Number(reason))
    })
  }

  static async reinstateBadge(badgeCid: string, addresses: string[]) {
    return await this.performBadgeAction(badgeCid, addresses, async (badgeId) => {
      await reinstateBadge(badgeId)
    })
  }

  static async createTopVotersBadge() {
    const today = Time.utc()
    const { start } = getPreviousMonthStartAndEnd(today.toDate())
    const result = await storeBadgeSpec(
      getTopVoterBadgeTitle(start),
      'top voter badge description', // TODO: missing description
      TOP_VOTERS_IMG_URL,
      today.endOf('month').toISOString()
    )
    const { badgeCid } = result
    await createSpec(badgeCid) // TODO: create with retries
    return badgeCid
  }

  static async queueTopVopVoterAirdrops(badgeCid: string) {
    const today = Time.utc().toDate()
    const { start, end } = getPreviousMonthStartAndEnd(today)
    const recipients = await VoteService.getTopVoters(start, end, TOP_VOTERS_PER_MONTH)
    // TODO: check recipients don't already have a badge for this month
    await this.queueAirdropJob(
      badgeCid,
      recipients.map((recipient) => recipient.address)
    )
  }
}
