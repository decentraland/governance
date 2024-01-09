import crypto from 'crypto'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import AirdropJobModel from '../back/models/AirdropJob'
import { VoteService } from '../back/services/vote'
import { AirdropJobStatus, AirdropOutcome } from '../back/types/AirdropJob'
import {
  airdropWithRetry,
  createSpecWithRetry,
  reinstateBadge,
  revokeBadge,
  trimOtterspaceId,
} from '../back/utils/contractInteractions'
import { OtterspaceBadge, OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { LAND_OWNER_BADGE_SPEC_CID, LEGISLATOR_BADGE_SPEC_CID, TOP_VOTERS_PER_MONTH } from '../constants'
import { storeBadgeSpecWithRetry } from '../entities/Badges/storeBadgeSpec'
import {
  ActionStatus,
  Badge,
  BadgeCreationResult,
  BadgeStatus,
  ErrorReason,
  OtterspaceRevokeReason,
  RevokeOrReinstateResult,
  UserBadges,
  shouldDisplayBadge,
  toGovernanceBadge,
} from '../entities/Badges/types'
import {
  getLandOwnerAddresses,
  getTopVotersBadgeSpec,
  getValidatedUsersForBadge,
  isSpecAlreadyCreated,
} from '../entities/Badges/utils'
import CoauthorModel from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress } from '../entities/Snapshot/utils'
import { inBackground, splitArray } from '../helpers'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorService } from './ErrorService'

export class BadgesService {
  public static async getBadges(address: string): Promise<UserBadges> {
    const otterspaceBadges: OtterspaceBadge[] = await OtterspaceSubgraph.get().getBadgesForAddress(address)
    return this.createBadgesList(otterspaceBadges)
  }

  static async getBadgesByCid(badgeCid: string) {
    const otterspaceBadges = await OtterspaceSubgraph.get().getBadges(badgeCid)
    return otterspaceBadges
  }

  private static createBadgesList(otterspaceBadges: OtterspaceBadge[]): UserBadges {
    const currentBadges: Badge[] = []
    const expiredBadges: Badge[] = []
    for (const otterspaceBadge of otterspaceBadges) {
      try {
        const badge = toGovernanceBadge(otterspaceBadge)
        if (shouldDisplayBadge(badge)) {
          if (badge.isPastBadge) {
            expiredBadges.push(badge)
          } else {
            currentBadges.push(badge)
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

      return await airdropWithRetry(badgeCid, eligibleUsers)
    } catch (e) {
      return { status: AirdropJobStatus.FAILED, error: JSON.stringify(e) }
    }
  }

  static async giveLegislatorBadges(proposals: ProposalAttributes[]) {
    const governanceProposals = proposals.filter((proposal) => proposal.type === ProposalType.Governance)
    if (governanceProposals.length === 0) {
      return
    }
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
    const { eligibleUsers, usersWithBadgesToReinstate } = await getValidatedUsersForBadge(
      LAND_OWNER_BADGE_SPEC_CID,
      landOwnerAddresses
    )

    const airdropOutcomes: AirdropOutcome[] = []
    const airdropBatches = splitArray(eligibleUsers, 50)
    for (const batch of airdropBatches) {
      const outcome = await airdropWithRetry(LAND_OWNER_BADGE_SPEC_CID, batch)
      airdropOutcomes.push(outcome)
    }

    const reinstateResults = await BadgesService.reinstateBadge(LAND_OWNER_BADGE_SPEC_CID, usersWithBadgesToReinstate)

    const failedAirdropOutcomes = airdropOutcomes.filter(
      ({ status, error }) =>
        status === AirdropJobStatus.FAILED &&
        error !== ErrorReason.NoUserWithoutBadge &&
        error !== ErrorReason.NoUserHasVoted
    )
    if (failedAirdropOutcomes.length > 0) {
      console.error('Unable to give LandOwner badges', failedAirdropOutcomes)

      ErrorService.report('Unable to give LandOwner badges', {
        category: ErrorCategory.Badges,
        failedAirdropOutcomes,
      })
    }

    const failedReinstatements = reinstateResults.filter((result) => result.status === ActionStatus.Failed)
    if (failedReinstatements.length > 0) {
      console.error('Unable to reinstate LandOwner badges', failedReinstatements)
      ErrorService.report('Unable to reinstate LandOwner badges', {
        category: ErrorCategory.Badges,
        failedReinstatements,
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
      await AirdropJobModel.create({ id: crypto.randomUUID(), badge_spec: badgeSpec, recipients })
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

    const actionResults: RevokeOrReinstateResult[] = []

    for (const badgeOwnership of badgeOwnerships) {
      const trimmedId = trimOtterspaceId(badgeOwnership.id)

      if (trimmedId === '') {
        actionResults.push({
          status: ActionStatus.Failed,
          address: badgeOwnership.address,
          badgeId: badgeOwnership.id,
          error: ErrorReason.InvalidBadgeId,
        })
      } else {
        try {
          await action(trimmedId)
          actionResults.push({
            status: ActionStatus.Success,
            address: badgeOwnership.address,
            badgeId: trimmedId,
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          actionResults.push({
            status: ActionStatus.Failed,
            address: badgeOwnership.address,
            badgeId: trimmedId,
            error: JSON.stringify(error?.reason || error),
          })
        }
      }
    }

    return actionResults
  }

  static async revokeBadge(
    badgeCid: string,
    addresses: string[],
    reason = OtterspaceRevokeReason.TenureEnded
  ): Promise<RevokeOrReinstateResult[]> {
    return await this.performBadgeAction(badgeCid, addresses, async (badgeId) => {
      await revokeBadge(badgeId, Number(reason))
    })
  }

  static async reinstateBadge(badgeCid: string, addresses: string[]) {
    return await this.performBadgeAction(badgeCid, addresses, async (badgeId) => {
      await reinstateBadge(badgeId)
    })
  }

  static async createTopVotersBadgeSpec(): Promise<BadgeCreationResult> {
    const badgeSpec = getTopVotersBadgeSpec()

    if (await isSpecAlreadyCreated(badgeSpec.title)) {
      return { status: ActionStatus.Failed, error: `Top Voter badge already exists`, badgeTitle: badgeSpec.title }
    }
    const result = await storeBadgeSpecWithRetry(badgeSpec)

    if (result.status === ActionStatus.Failed || !result.badgeCid) return result
    return await createSpecWithRetry(result.badgeCid)
  }

  static async queueTopVopVoterAirdrops(badgeCid: string) {
    const recipients = await VoteService.getTopVotersForPreviousMonth(TOP_VOTERS_PER_MONTH)
    await this.queueAirdropJob(
      badgeCid,
      recipients.map((recipient) => recipient.address)
    )
  }

  static giveFinishProposalBadges(proposalsWithOutcome: ProposalWithOutcome[]) {
    const passedProposals = proposalsWithOutcome.filter((proposal) => proposal.newStatus === ProposalStatus.Passed)
    inBackground(async () => {
      try {
        await BadgesService.giveLegislatorBadges(passedProposals)
      } catch (error) {
        ErrorService.report('Error while attempting to give badges', {
          error,
          category: ErrorCategory.Badges,
          passedProposals,
        })
      }
    })
  }
}
