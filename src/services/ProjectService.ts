import crypto from 'crypto'

import { TransparencyVesting } from '../clients/Transparency'
import { VestingWithLogs } from '../clients/VestingData'
import UnpublishedBidModel from '../entities/Bid/model'
import { BidProposalConfiguration } from '../entities/Bid/types'
import { GrantTier } from '../entities/Grant/GrantTier'
import { GRANT_PROPOSAL_DURATION_IN_SECONDS } from '../entities/Grant/constants'
import { GrantRequest, ProjectStatus, VestingStatus } from '../entities/Grant/types'
import { PersonnelInCreation, ProjectLinkInCreation, ProjectMilestoneInCreation } from '../entities/Project/types'
import ProposalModel from '../entities/Proposal/model'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import {
  GrantProposalConfiguration,
  LatestUpdate,
  ProposalAttributes,
  ProposalProjectWithUpdate,
  ProposalStatus,
  ProposalType,
} from '../entities/Proposal/types'
import { DEFAULT_CHOICES, asNumber, getProposalEndDate, isProjectProposal } from '../entities/Proposal/utils'
import { isSameAddress } from '../entities/Snapshot/utils'
import UpdateModel from '../entities/Updates/model'
import { UpdateAttributes } from '../entities/Updates/types'
import { getPublicUpdates } from '../entities/Updates/utils'
import { formatError, inBackground } from '../helpers'
import PersonnelModel, { PersonnelAttributes } from '../models/Personnel'
import ProjectModel, { Project, ProjectAttributes, ProjectInList, ProjectQueryResult } from '../models/Project'
import ProjectLinkModel, { ProjectLink } from '../models/ProjectLink'
import ProjectMilestoneModel, { ProjectMilestone, ProjectMilestoneStatus } from '../models/ProjectMilestone'
import Time from '../utils/date/Time'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'
import {
  createProposalProject,
  getProjectFunding,
  getProjectStatus,
  toGovernanceProjectStatus,
} from '../utils/projects'

import { BudgetService } from './BudgetService'
import { ErrorService } from './ErrorService'
import { ProposalInCreation } from './ProposalService'
import { VestingService } from './VestingService'

function newestVestingFirst(a: TransparencyVesting, b: TransparencyVesting): number {
  const startDateSort = new Date(b.vesting_start_at).getTime() - new Date(a.vesting_start_at).getTime()
  const finishDateSort = new Date(b.vesting_finish_at).getTime() - new Date(a.vesting_finish_at).getTime()

  return startDateSort !== 0 ? startDateSort : finishDateSort
}

export class ProjectService {
  public static async getProposalProjects() {
    const proposalWithProjects = await ProposalModel.getProjectList()
    const vestings = await VestingService.getAllVestings()
    const proposalProjects: ProposalProjectWithUpdate[] = []

    await Promise.all(
      proposalWithProjects.map(async (proposal) => {
        try {
          const proposalVestings = vestings.filter((item) => item.proposal_id === proposal.id).sort(newestVestingFirst)
          const prioritizedVesting: TransparencyVesting | undefined =
            proposalVestings.find(
              (vesting) =>
                vesting.vesting_status === VestingStatus.InProgress || vesting.vesting_status === VestingStatus.Finished
            ) || proposalVestings[0]
          const project = createProposalProject(proposal, prioritizedVesting)

          try {
            const update = await this.getProjectLatestUpdate(project.id)
            const projectWithUpdate: ProposalProjectWithUpdate = {
              ...project,
              ...update,
            }

            return proposalProjects.push(projectWithUpdate)
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
    return proposalProjects
  }

  public static async getProjects(): Promise<ProjectInList[]> {
    const projectsQueryResults = await ProjectModel.getProjectsWithUpdates()
    const vestings = await VestingService.getAllVestings2()
    const updatedProjects = this.getProjectInList(projectsQueryResults, vestings)
    return updatedProjects
  }

  private static getProjectInList(
    projectQueryResult: ProjectQueryResult[],
    latestVestings: VestingWithLogs[]
  ): ProjectInList[] {
    return (
      projectQueryResult.map((result) => {
        const latestVestingAddress = result.vesting_addresses[result.vesting_addresses.length - 1]
        const vestingWithLogs = latestVestings.find((vesting) => isSameAddress(vesting.address, latestVestingAddress))
        const funding = getProjectFunding(result, vestingWithLogs)
        const status = getProjectStatus(result, vestingWithLogs)
        const { size, tier, category } = result.configuration
        const { updates, user, ...rest } = result
        return {
          ...rest,
          author: user,
          configuration: { size, tier, category: category || result.type },
          status,
          funding,
          latest_update: this.getProjectLatestUpdate2(updates ?? []),
        }
      }) || []
    )
  }

  private static getProjectLatestUpdate2(updates: UpdateAttributes[]): LatestUpdate {
    if (!updates || updates.length === 0) {
      return { update_timestamp: 0 }
    }

    const publicUpdates = getPublicUpdates(updates)
    const currentUpdate = publicUpdates[0]
    if (!currentUpdate) {
      return { update_timestamp: 0 }
    }
    const { id, introduction, status, health, completion_date } = currentUpdate
    return {
      update: { id, introduction, status, health, completion_date, index: publicUpdates.length },
      update_timestamp: currentUpdate?.completion_date ? Time(currentUpdate?.completion_date).unix() : 0,
    }
  }

  private static async getProjectLatestUpdate(proposalId: string): Promise<LatestUpdate> {
    const updates = await UpdateModel.find<UpdateAttributes>({ proposal_id: proposalId }, {
      created_at: 'desc',
    } as never)
    if (!updates || updates.length === 0) {
      return { update_timestamp: 0 }
    }

    const publicUpdates = getPublicUpdates(updates)
    const currentUpdate = publicUpdates[0]
    if (!currentUpdate) {
      return { update_timestamp: 0 }
    }
    return {
      update: { ...currentUpdate, index: publicUpdates.length },
      update_timestamp: currentUpdate?.completion_date ? Time(currentUpdate?.completion_date).unix() : 0,
    }
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

  static async createProjects(proposalsWithOutcome: ProposalWithOutcome[]) {
    inBackground(async () => {
      const proposalsToCreateProjectFor = proposalsWithOutcome.filter(
        (proposal) => isProjectProposal(proposal.type) && proposal.newStatus === ProposalStatus.Passed
      )
      proposalsToCreateProjectFor.forEach((proposal) => ProjectService.createProject(proposal))
    })
  }

  private static async createProject(proposal: ProposalWithOutcome): Promise<ProjectAttributes | null> {
    try {
      const creationDate = new Date()
      const newProject = await ProjectModel.create({
        id: crypto.randomUUID(),
        proposal_id: proposal.id,
        title: proposal.title,
        about: proposal.configuration.abstract,
        status: ProjectStatus.Pending,
        created_at: creationDate,
      })

      await ProjectService.createPersonnel(proposal, newProject, creationDate)
      await ProjectService.createMilestones(proposal, newProject, creationDate)

      return newProject
    } catch (error) {
      ErrorService.report('Error creating project', {
        error: formatError(error as Error),
        category: ErrorCategory.Project,
      })
      return null
    }
  }

  private static async createPersonnel(proposal: ProposalAttributes, project: ProjectAttributes, creationDate: Date) {
    const newPersonnel: PersonnelAttributes[] = []
    const config =
      proposal.type === ProposalType.Grant
        ? (proposal.configuration as GrantProposalConfiguration)
        : (proposal.configuration as BidProposalConfiguration)
    config.members?.forEach((member) => {
      if (member) {
        newPersonnel.push({
          ...member,
          id: crypto.randomUUID(),
          project_id: project.id,
          created_at: creationDate,
          deleted: false,
        })
      }
    })
    await PersonnelModel.createMany(newPersonnel)
  }

  private static async createMilestones(proposal: ProposalAttributes, project: ProjectAttributes, creationDate: Date) {
    const newMilestones: ProjectMilestone[] = []
    const config =
      proposal.type === ProposalType.Grant
        ? (proposal.configuration as GrantProposalConfiguration)
        : (proposal.configuration as BidProposalConfiguration)

    config.milestones?.forEach((milestone) => {
      newMilestones.push({
        id: crypto.randomUUID(),
        project_id: project.id,
        created_at: creationDate,
        title: milestone.title,
        description: milestone.tasks,
        delivery_date: new Date(milestone.delivery_date),
        status: ProjectMilestoneStatus.Pending,
        created_by: proposal.user,
      })
    })
    await ProjectMilestoneModel.createMany(newMilestones)
  }

  static async getUpdatedProject(id: string) {
    const project = await ProjectModel.getProject(id)
    if (!project) {
      throw new Error(`Project not found: "${id}"`)
    }
    return await ProjectService.updateStatusFromVesting(project)
  }

  private static async updateStatusFromVesting(project: Project) {
    try {
      const latestVesting = project.vesting_addresses[project.vesting_addresses.length - 1]
      const vestingWithLogs = await VestingService.getVestingWithLogs(latestVesting)
      const updatedProjectStatus = toGovernanceProjectStatus(vestingWithLogs.status)
      await ProjectModel.update({ status: updatedProjectStatus, updated_at: new Date() }, { id: project.id })

      return {
        ...project,
        status: updatedProjectStatus,
        funding: { vesting: vestingWithLogs, enacted_at: vestingWithLogs.start_at },
      }
    } catch (error) {
      ErrorService.report('Unable to update project status', { error, id: project.id, category: ErrorCategory.Project })
      return project
    }
  }

  static async addPersonnel(newPersonnel: PersonnelInCreation, user?: string) {
    const { address } = newPersonnel
    return await PersonnelModel.create<PersonnelAttributes>({
      ...newPersonnel,
      address: address && address?.length > 0 ? address : null,
      id: crypto.randomUUID(),
      updated_by: user,
      created_at: new Date(),
      deleted: false,
    })
  }

  static async deletePersonnel(personnel_id: PersonnelAttributes['id'], user: string) {
    const result = await PersonnelModel.update(
      { deleted: true, updated_by: user, updated_at: new Date() },
      { id: personnel_id }
    )
    return !!result && result.rowCount === 1 ? personnel_id : null
  }

  static async addLink(newLink: ProjectLinkInCreation, user: string) {
    return await ProjectLinkModel.create<ProjectLink>({
      ...newLink,
      id: crypto.randomUUID(),
      created_by: user,
      created_at: new Date(),
    })
  }

  static async deleteLink(linkId: ProjectLink['id']) {
    const result = await ProjectLinkModel.delete({ id: linkId })
    return !!result && result.rowCount === 1 ? linkId : null
  }

  static async addMilestone(newMilestone: ProjectMilestoneInCreation, user: string) {
    return await ProjectMilestoneModel.create({
      ...newMilestone,
      status: ProjectMilestoneStatus.Pending,
      id: crypto.randomUUID(),
      created_by: user,
      created_at: new Date(),
    })
  }

  static async deleteMilestone(milestone_id: ProjectMilestone['id']) {
    const result = await ProjectMilestoneModel.delete({ id: milestone_id })

    return !!result && result.rowCount === 1 ? milestone_id : null
  }

  static async isAuthorOrCoauthor(user: string, projectId: string) {
    return await ProjectModel.isAuthorOrCoauthor(user, projectId)
  }
}
