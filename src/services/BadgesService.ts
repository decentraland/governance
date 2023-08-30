import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { v1 as uuid } from 'uuid'

import AirdropJobModel, { AirdropJobStatus, AirdropOutcome } from '../back/models/AirdropJob'
import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { LAND_OWNER_BADGE_SPEC_CID, LEGISLATOR_BADGE_SPEC_CID } from '../constants'
import {
  ActionResult,
  ActionStatus,
  Badge,
  BadgeStatus,
  BadgeStatusReason,
  ErrorReason,
  OtterspaceRevokeReason,
  UserBadges,
  toBadgeStatus,
} from '../entities/Badges/types'
import {
  airdrop,
  getLandOwnerAddresses,
  getValidatedUsersForBadge,
  reinstateBadge,
  revokeBadge,
  trimOtterspaceId,
} from '../entities/Badges/utils'
import CoauthorModel from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress } from '../entities/Snapshot/utils'
import { inBackground, splitArray } from '../helpers'
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
      const { eligibleUsers, usersWithBadgesToReinstate, error } = await getValidatedUsersForBadge(badgeCid, users)
      if (usersWithBadgesToReinstate.length > 0) {
        inBackground(async () => {
          return await this.reinstateBadge(badgeCid, usersWithBadgesToReinstate)
        })
      }

      if (error) {
        return { status: AirdropJobStatus.FAILED, error }
      }

      return await this.airdropWithRetry(badgeCid, eligibleUsers)
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

  static async giveAndRevokeLandOwnerBadges() {
    const landOwnerAddresses = await getLandOwnerAddresses()
    const { eligibleUsers, usersWithBadgesToReinstate } = await getValidatedUsersForBadge(
      LAND_OWNER_BADGE_SPEC_CID,
      landOwnerAddresses
    )

    const outcomes = await Promise.all(
      splitArray([...eligibleUsers, ...usersWithBadgesToReinstate], 50).map((addresses) =>
        BadgesService.giveBadgeToUsers(LAND_OWNER_BADGE_SPEC_CID, addresses)
      )
    )
    const failedOutcomes = outcomes.filter(
      ({ status, error }) =>
        status === AirdropJobStatus.FAILED &&
        error !== ErrorReason.NoUserWithoutBadge &&
        error !== ErrorReason.NoUserHasVoted
    )
    if (failedOutcomes.length > 0) {
      console.error('Unable to give LandOwner badges', failedOutcomes)

      ErrorService.report('Unable to give LandOwner badges', {
        category: ErrorCategory.Badges,
        failedOutcomes,
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
}
