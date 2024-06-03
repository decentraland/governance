import crypto from 'crypto'

import PersonnelModel, { PersonnelAttributes } from '../back/models/Personnel'
import ProjectModel, { ProjectAttributes } from '../back/models/Project'
import ProjectLinkModel, { ProjectLink } from '../back/models/ProjectLink'
import ProjectMilestoneModel, { ProjectMilestone, ProjectMilestoneStatus } from '../back/models/ProjectMilestone'
import { TransparencyVesting } from '../clients/Transparency'
import UnpublishedBidModel from '../entities/Bid/model'
import { BidProposalConfiguration } from '../entities/Bid/types'
import { GrantTier } from '../entities/Grant/GrantTier'
import { GRANT_PROPOSAL_DURATION_IN_SECONDS } from '../entities/Grant/constants'
import { GrantRequest, ProjectStatus, TransparencyProjectStatus } from '../entities/Grant/types'
import { PersonnelInCreation, ProjectLinkInCreation } from '../entities/Project/types'
import ProposalModel from '../entities/Proposal/model'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import {
  GrantProposalConfiguration,
  ProposalProjectWithUpdate,
  ProposalStatus,
  ProposalType,
} from '../entities/Proposal/types'
import { DEFAULT_CHOICES, asNumber, getProposalEndDate, isProjectProposal } from '../entities/Proposal/utils'
import UpdateModel from '../entities/Updates/model'
import { IndexedUpdate, UpdateAttributes } from '../entities/Updates/types'
import { getPublicUpdates } from '../entities/Updates/utils'
import { formatError, inBackground } from '../helpers'
import Time from '../utils/date/Time'
import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'
import { createProposalProject } from '../utils/projects'

import { BudgetService } from './BudgetService'
import { ProposalInCreation } from './ProposalService'
import { VestingService } from './VestingService'

function newestVestingFirst(a: TransparencyVesting, b: TransparencyVesting): number {
  const startDateSort = new Date(b.vesting_start_at).getTime() - new Date(a.vesting_start_at).getTime()
  const finishDateSort = new Date(b.vesting_finish_at).getTime() - new Date(a.vesting_finish_at).getTime()

  return startDateSort !== 0 ? startDateSort : finishDateSort
}

export class ProjectService {
  public static async getProjects() {
    const data = await ProposalModel.getProjectList()
    const vestings = await VestingService.getAllVestings()
    const projects: ProposalProjectWithUpdate[] = []

    await Promise.all(
      data.map(async (proposal) => {
        try {
          const proposalVestings = vestings.filter((item) => item.proposal_id === proposal.id).sort(newestVestingFirst)
          const prioritizedVesting: TransparencyVesting | undefined =
            proposalVestings.find(
              (vesting) =>
                vesting.vesting_status === TransparencyProjectStatus.InProgress ||
                vesting.vesting_status === TransparencyProjectStatus.Finished
            ) || proposalVestings[0]
          const project = createProposalProject(proposal, prioritizedVesting)

          try {
            const update = await this.getProjectLatestUpdate(project.id)
            const projectWithUpdate: ProposalProjectWithUpdate = {
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

  static async createProjects(proposalsWithOutcome: ProposalWithOutcome[]) {
    inBackground(async () => {
      const proposalsToCreateProjectFor = proposalsWithOutcome.filter(
        (proposal) => isProjectProposal(proposal.type) && proposal.newStatus === ProposalStatus.Passed
      )
      proposalsToCreateProjectFor.forEach((proposal) => ProjectService.createProject(proposal))
    })
  }

  private static async createProject(proposal: ProposalWithOutcome) {
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
  }

  private static async createPersonnel(proposal: ProposalWithOutcome, project: ProjectAttributes, creationDate: Date) {
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

  private static async createMilestones(proposal: ProposalWithOutcome, project: ProjectAttributes, creationDate: Date) {
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

  static async getProject(id: string) {
    const project = await ProjectModel.getProject(id)
    if (!project) {
      throw new Error(`Project not found: "${id}"`)
    }

    return project
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

  static async isAuthorOrCoauthor(user: string, projectId: string) {
    return await ProjectModel.isAuthorOrCoauthor(user, projectId)
  }

  static async startProject(id: string, updated_at: Date) {
    await ProjectModel.update({ status: ProjectStatus.InProgress, updated_at }, { proposal_id: id })
  }
}
