import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { v1 as uuid } from 'uuid'

import AirdropJobModel, { AirdropJobStatus, AirdropOutcome } from '../back/models/AirdropJob'
import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { LEGISLATOR_BADGE_SPEC_CID } from '../constants'
import { Badge, BadgeStatus, BadgeStatusReason, UserBadges, toBadgeStatus } from '../entities/Badges/types'
import { airdrop } from '../entities/Badges/utils'
import CoauthorModel from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress } from '../entities/Snapshot/utils'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorService } from './ErrorService'

const TRANSACTION_UNDERPRICED = -32000

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
      const badgeOwners = await OtterspaceSubgraph.get().getBadgeOwners(badgeCid)
      const usersWithoutBadge = users.filter((user) => {
        return !badgeOwners.includes(user.toLowerCase())
      })

      if (usersWithoutBadge.length > 0) {
        return await this.airdropWithRetry(badgeCid, usersWithoutBadge)
      } else {
        return { status: AirdropJobStatus.FAILED, error: 'All recipients already have this badge' }
      }
    } catch (e) {
      return { status: AirdropJobStatus.FAILED, error: JSON.stringify(e) }
    }
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
      return errorCode === TRANSACTION_UNDERPRICED
    } catch (e) {
      return false
    }
  }

  static async giveLegislatorBadges(acceptedProposals: ProposalAttributes[]) {
    const governanceProposals = acceptedProposals.filter((proposal) => proposal.type === ProposalType.Governance)
    const coauthors = await CoauthorModel.findAllCoauthors(governanceProposals, CoauthorStatus.APPROVED)
    const authors = governanceProposals.map((proposal) => proposal.user)
    const authorsAndCoauthors = new Set([...authors.map(getChecksumAddress), ...coauthors.map(getChecksumAddress)])
    await this.queueAirdropJob(LEGISLATOR_BADGE_SPEC_CID, Array.from(authorsAndCoauthors))
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
}
