import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { v1 as uuid } from 'uuid'

import AirdropJobModel, { AirdropJobStatus, AirdropOutcome } from '../back/models/AirdropJob'
import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { LEGISLATOR_BADGE_SPEC_CID } from '../constants'
import { Badge, BadgeStatus, BadgeStatusReason, UserBadges, toBadgeStatus } from '../entities/Badges/types'
import { airdrop } from '../entities/Badges/utils'
import CoauthorModel from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress } from '../entities/Snapshot/utils'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorService } from './ErrorService'

const TRANSACTION_UNDERPRICED_ERROR_CODE = -32000

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
      const usersWithoutBadge = await this.getUsersWithoutBadge(badgeCid, users)
      if (usersWithoutBadge.length === 0) {
        return { status: AirdropJobStatus.FAILED, error: 'All recipients already have this badge' }
      }
      const usersWhoVoted = await this.getUsersWhoVoted(usersWithoutBadge)
      if (usersWhoVoted.length === 0) {
        return { status: AirdropJobStatus.FAILED, error: 'Recipients have never voted' }
      }
      return await this.airdropWithRetry(badgeCid, usersWithoutBadge)
    } catch (e) {
      return { status: AirdropJobStatus.FAILED, error: JSON.stringify(e) }
    }
  }

  private static async getUsersWhoVoted(usersWithoutBadge: string[]) {
    const voteResults = await Promise.all(
      usersWithoutBadge.map(async (user) => ({
        address: user,
        hasVoted: await SnapshotGraphql.get().hasVoted(user),
      }))
    )
    return voteResults.filter((result) => result.hasVoted).map((result) => result.address)
  }

  private static async getUsersWithoutBadge(badgeCid: string, users: string[]) {
    const badgeOwners = await OtterspaceSubgraph.get().getBadgeOwners(badgeCid)
    return users.filter((user) => !badgeOwners.includes(user.toLowerCase()))
  }

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
    await this.queueAirdropJob(LEGISLATOR_BADGE_SPEC_CID, Array.from(authorsAndCoauthors))
  }

  private static async queueAirdropJob(badgeSpec: string, recipients: string[]) {
    if (!LEGISLATOR_BADGE_SPEC_CID || LEGISLATOR_BADGE_SPEC_CID.length === 0) {
      ErrorService.report('Unable to create AirdropJob. LEGISLATOR_BADGE_SPEC_CID missing.', {
        category: ErrorCategory.Badges,
        recipients,
      })
      return
    }
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
}
