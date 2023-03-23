import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import filter from 'lodash/filter'
import isNil from 'lodash/isNil'

import { DclData, TransparencyGrant } from '../clients/DclData'
import { GrantTier } from '../entities/Grant/GrantTier'
import { GRANT_PROPOSAL_DURATION_IN_SECONDS } from '../entities/Grant/constants'
import { GrantRequest, GrantStatus } from '../entities/Grant/types'
import { isCurrentGrant } from '../entities/Grant/utils'
import ProposalModel from '../entities/Proposal/model'
import {
  Grant,
  GrantProposalConfiguration,
  GrantWithUpdate,
  ProposalAttributes,
  ProposalStatus,
  ProposalType,
} from '../entities/Proposal/types'
import { DEFAULT_CHOICES, asNumber, getProposalEndDate } from '../entities/Proposal/utils'
import UpdateModel from '../entities/Updates/model'
import { IndexedUpdate, UpdateAttributes } from '../entities/Updates/types'
import { getPublicUpdates } from '../entities/Updates/utils'
import { formatError } from '../helpers'
import { isDevEnv } from '../modules/isDevEnv'

import { BudgetService } from './BudgetService'
import { ProposalInCreation } from './ProposalService'

export class GrantsService {
  public static async getGrants() {
    const grants = await DclData.get().getGrants()
    const enactedGrants = filter(grants, (item) => item.status === ProposalStatus.Enacted)

    const current: GrantWithUpdate[] = []
    const past: GrantWithUpdate[] = []

    await Promise.all(
      enactedGrants.map(async (grant: TransparencyGrant) => {
        if (!grant.vesting_address && !grant.enacting_tx) {
          return
        }
        try {
          //TODO: we could findAll and iterate in memory
          const createdAt = await this.getCreationDate(grant)
          const newGrant: Grant = this.parseTransparencyGrant(grant, createdAt)

          Object.assign(newGrant, this.getVestingData(grant))

          try {
            const update = await this.getGrantLatestUpdate(grant.id)
            const grantWithUpdate: GrantWithUpdate = {
              ...newGrant,
              ...this.getUpdateData(update),
            }
            return isCurrentGrant(newGrant.status) ? current.push(grantWithUpdate) : past.push(grantWithUpdate)
          } catch (error) {
            logger.error(`Failed to fetch grant update data from proposal ${grant.id}`, formatError(error as Error))
          }
        } catch (error) {
          if (!isDevEnv()) {
            logger.error(`Failed to get data for ${grant.id}`, formatError(error as Error))
          }
        }
      })
    )

    const pendingNewGrants = await ProposalModel.getPendingNewGrants()
    pendingNewGrants.map((proposal) => {
      current.push({ ...this.toPendingGovernanceGrant(proposal), update: null, update_timestamp: undefined })
    })

    return {
      current,
      past,
      total: grants.length,
    }
  }

  private static toPendingGovernanceGrant(grant: ProposalAttributes): Grant {
    return {
      id: grant.id,
      title: grant.title,
      user: grant.user,
      size: grant.configuration.size,
      configuration: {
        category: grant.configuration.category,
        tier: grant.configuration.tier,
      },
      status: GrantStatus.Pending,
      created_at: grant.created_at.getTime(),
      token: undefined,
      enacted_at: undefined,
    }
  }

  private static parseTransparencyGrant(grant: TransparencyGrant, createdAt: Date) {
    return {
      id: grant.id,
      size: grant.size,
      configuration: {
        category: grant.category,
        tier: grant.tier,
      },
      status: grant.vesting_status,
      user: grant.user,
      title: grant.title,
      token: grant.token,
      created_at: Time(createdAt).unix(),
      enacted_at: this.getEnactedDate(grant),
    }
  }

  private static getUpdateData(update: (UpdateAttributes & { index: number }) | null) {
    return {
      update,
      update_timestamp: update?.completion_date ? Time(update?.completion_date).unix() : 0,
    }
  }

  private static getEnactedDate(grant: TransparencyGrant) {
    return grant.tx_date ? Time(grant.tx_date).unix() : Time(grant.vesting_start_at).unix()
  }

  private static getVestingData(grant: TransparencyGrant) {
    if (grant.tx_date) {
      return {
        enacting_tx: grant.enacting_tx,
        tx_amount: grant.tx_amount,
      }
    } else {
      const { vesting_total_amount, vesting_released, vesting_releasable } = grant

      if (isNil(vesting_total_amount) || isNil(vesting_released) || isNil(vesting_releasable)) {
        throw new Error('Missing vesting data')
      }

      return {
        contract: {
          vesting_total_amount: Math.round(vesting_total_amount),
          vestedAmount: Math.round(vesting_released + vesting_releasable),
          releasable: Math.round(vesting_releasable),
          released: Math.round(vesting_released),
          start_at: Time(grant.vesting_start_at).unix(),
          finish_at: Time(grant.vesting_finish_at).unix(),
        },
      }
    }
  }

  private static async getCreationDate(grant: TransparencyGrant) {
    const proposal = await ProposalModel.findOne<ProposalAttributes>(grant.id)
    if (!proposal) {
      throw new Error('Proposal not found')
    }
    return proposal.created_at
  }

  private static async getGrantLatestUpdate(proposalId: string): Promise<IndexedUpdate | null> {
    const updates = await UpdateModel.find<UpdateAttributes>({ proposal_id: proposalId }, {
      created_at: 'desc',
    } as never)
    if (!updates || updates.length === 0) {
      return null
    }

    const publicUpdates = getPublicUpdates(updates)
    const currentUpdate = publicUpdates[0]
    if (!currentUpdate) {
      return null
    }

    return { ...currentUpdate, index: publicUpdates.length }
  }

  public static async getGrantInCreation(grantRequest: GrantRequest, user: string) {
    const grantSize = Number(grantRequest.funding || 0)

    await BudgetService.validateGrantRequest(grantSize, grantRequest.category)

    const configuration: GrantProposalConfiguration = {
      ...grantRequest,
      size: Number(grantRequest.funding),
      tier: GrantTier.getTypeFromBudget(grantSize),
      choices: DEFAULT_CHOICES,
      categoryAssessment: this.getCategoryAssessment(grantRequest),
    }

    const grantInCreation: ProposalInCreation = {
      user,
      type: ProposalType.Grant,
      required_to_pass: GrantTier.getVPThreshold(grantSize),
      finish_at: this.getGrantProposalEndDate(),
      configuration,
    }

    return grantInCreation
  }

  private static getCategoryAssessment(grantRequest: GrantRequest) {
    return (
      grantRequest.accelerator ||
      grantRequest.coreUnit ||
      grantRequest.documentation ||
      grantRequest.inWorldContent ||
      grantRequest.socialMediaContent ||
      grantRequest.sponsorship ||
      grantRequest.platform
    )
  }

  private static getGrantProposalEndDate() {
    return getProposalEndDate(asNumber(GRANT_PROPOSAL_DURATION_IN_SECONDS))
  }
}
