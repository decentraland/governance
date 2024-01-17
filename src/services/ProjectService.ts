import UnpublishedBidModel from '../entities/Bid/model'
import { GrantTier } from '../entities/Grant/GrantTier'
import { GRANT_PROPOSAL_DURATION_IN_SECONDS } from '../entities/Grant/constants'
import { GrantRequest } from '../entities/Grant/types'
import ProposalModel from '../entities/Proposal/model'
import {
  GrantProposalConfiguration,
  ProjectWithUpdate,
  ProposalAttributes,
  ProposalType,
} from '../entities/Proposal/types'
import { DEFAULT_CHOICES, asNumber, getProposalEndDate } from '../entities/Proposal/utils'
import UpdateModel from '../entities/Updates/model'
import { IndexedUpdate, UpdateAttributes } from '../entities/Updates/types'
import { getPublicUpdates } from '../entities/Updates/utils'
import { formatError } from '../helpers'
import Time from '../utils/date/Time'
import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'
import { createProject } from '../utils/projects'

import { BudgetService } from './BudgetService'
import { ProposalInCreation } from './ProposalService'
import { VestingService } from './VestingService'

export class ProjectService {
  public static async getProjects() {
    const data = await ProposalModel.getProjectList()
    const vestings = await VestingService.getAllVestings()
    const projects: ProjectWithUpdate[] = []

    await Promise.all(
      data.map(async (proposal: ProposalAttributes) => {
        try {
          const proposalVestings = vestings
            .filter((item) => item.proposal_id === proposal.id)
            .sort(function compare(a, b) {
              const dateA = new Date(a.vesting_start_at).getTime()
              const dateB = new Date(b.vesting_start_at).getTime()
              return dateB - dateA
            })
          const latestVesting = proposalVestings[0]
          const project = createProject(proposal, latestVesting)

          try {
            const update = await this.getProjectLatestUpdate(project.id)
            const projectWithUpdate: ProjectWithUpdate = {
              ...project,
              ...this.getUpdateData(update),
            }

            return projects.push(projectWithUpdate)
          } catch (error) {
            logger.error(`Failed to fetch grant update data from proposal ${project.id}`, formatError(error as Error))
          }
        } catch (error) {
          if (isProdEnv()) {
            logger.error(`Failed to get data for ${proposal.id}`, formatError(error as Error))
          }
        }
      })
    )

    return {
      data: projects,
    }
  }

  private static getUpdateData(update: (UpdateAttributes & { index: number }) | null) {
    return {
      update,
      update_timestamp: update?.completion_date ? Time(update?.completion_date).unix() : 0,
    }
  }

  private static async getProjectLatestUpdate(proposalId: string): Promise<IndexedUpdate | null> {
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
      finish_at: getProposalEndDate(asNumber(GRANT_PROPOSAL_DURATION_IN_SECONDS)),
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

  static async getOpenPitchesTotal() {
    const data = await ProposalModel.getOpenPitchesTotal()

    return {
      total: Number(data.total),
    }
  }

  static async getOpenTendersTotal() {
    const data = await UnpublishedBidModel.getOpenTendersTotal()

    return {
      total: Number(data.total),
    }
  }
}
