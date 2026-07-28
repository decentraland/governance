import { randomUUID } from 'crypto'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import CoauthorModel from '../../src/entities/Coauthor/model'
import { CoauthorAttributes, CoauthorStatus } from '../../src/entities/Coauthor/types'
import { ProjectStatus } from '../../src/entities/Grant/types'
import ProposalModel from '../../src/entities/Proposal/model'
import { createTestProposal } from '../../src/entities/Proposal/testHelpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import SubscriptionModel from '../../src/entities/Subscription/model'
import UpdateModel from '../../src/entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../../src/entities/Updates/types'
import PersonnelModel from '../../src/models/Personnel'
import ProjectModel from '../../src/models/Project'
import ProjectLinkModel from '../../src/models/ProjectLink'
import ProjectMilestoneModel, { ProjectMilestoneStatus } from '../../src/models/ProjectMilestone'

const TEST_GRANT_SIZE = 10000

export type ProjectRow = { status: string; updated_at: Date | null }

export async function insertProposal(
  status: ProposalStatus,
  vestingAddresses: string[] = []
): Promise<ProposalAttributes> {
  const proposal = {
    ...createTestProposal(ProposalType.Grant, status, TEST_GRANT_SIZE),
    vesting_addresses: vestingAddresses,
  }
  await ProposalModel.create({
    ...proposal,
    // Match the production insert (ProposalService.saveToDb) which stores these as JSON strings.
    configuration: JSON.stringify(proposal.configuration),
    snapshot_proposal: JSON.stringify(proposal.snapshot_proposal),
  } as never)
  return proposal
}

/**
 * Inserts a proposal with arbitrary column overrides, for the query-builder tests that need to vary
 * type, author, dates and configuration rather than just status.
 */
export async function insertProposalWith(overrides: Partial<ProposalAttributes>): Promise<ProposalAttributes> {
  const base = createTestProposal(
    (overrides.type as ProposalType) ?? ProposalType.Grant,
    (overrides.status as ProposalStatus) ?? ProposalStatus.Active,
    TEST_GRANT_SIZE
  )
  const proposal = { ...base, vesting_addresses: [], ...overrides } as ProposalAttributes
  await ProposalModel.create({
    ...proposal,
    configuration: JSON.stringify(proposal.configuration),
    snapshot_proposal: JSON.stringify(proposal.snapshot_proposal),
  } as never)
  return proposal
}

export async function insertProject(proposalId: string): Promise<string> {
  const projectId = randomUUID()
  await ProjectModel.create({
    id: projectId,
    proposal_id: proposalId,
    title: 'Integration test project',
    status: ProjectStatus.InProgress,
    created_at: new Date(),
  })
  return projectId
}

export async function insertUpdate(
  proposalId: string,
  projectId: string,
  status: UpdateStatus
): Promise<UpdateAttributes> {
  const update: UpdateAttributes = {
    id: randomUUID(),
    proposal_id: proposalId,
    project_id: projectId,
    status,
    due_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  }
  await UpdateModel.create(update)
  return update
}

export async function insertPersonnel(projectId: string, name: string, deleted = false): Promise<string> {
  const id = randomUUID()
  await PersonnelModel.create({
    id,
    project_id: projectId,
    name,
    address: null,
    role: 'Engineer',
    about: 'About the team member',
    deleted,
    created_at: new Date(),
  })
  return id
}

export async function insertMilestone(projectId: string, title: string): Promise<string> {
  const id = randomUUID()
  await ProjectMilestoneModel.create({
    id,
    project_id: projectId,
    title,
    description: 'A milestone',
    delivery_date: new Date(),
    status: ProjectMilestoneStatus.Pending,
    created_by: '0x2ac89522cb415ac333e64f52a1a5693218cebd58',
    created_at: new Date(),
  })
  return id
}

export async function insertProjectLink(projectId: string, label: string): Promise<string> {
  const id = randomUUID()
  await ProjectLinkModel.create({
    id,
    project_id: projectId,
    label,
    url: 'https://example.com',
    created_by: '0x2ac89522cb415ac333e64f52a1a5693218cebd58',
    created_at: new Date(),
  })
  return id
}

export async function insertCoauthor(
  proposalId: string,
  address: string,
  status: CoauthorStatus
): Promise<CoauthorAttributes> {
  const coauthor: CoauthorAttributes = { proposal_id: proposalId, address: address.toLowerCase(), status }
  await CoauthorModel.create(coauthor)
  return coauthor
}

export async function insertSubscription(proposalId: string, user: string): Promise<void> {
  await SubscriptionModel.create({ proposal_id: proposalId, user: user.toLowerCase(), created_at: new Date() })
}

export async function readProposalStatus(id: string): Promise<string | undefined> {
  const rows = await ProposalModel.namedQuery<{ status: string }>(
    'test_read_proposal_status',
    SQL`SELECT status FROM ${table(ProposalModel)} WHERE id = ${id}`
  )
  return rows[0]?.status
}

export async function readProposalVestingAddresses(id: string): Promise<string[]> {
  const rows = await ProposalModel.namedQuery<{ vesting_addresses: string[] }>(
    'test_read_proposal_vesting_addresses',
    SQL`SELECT vesting_addresses FROM ${table(ProposalModel)} WHERE id = ${id}`
  )
  return rows[0]?.vesting_addresses ?? []
}

export async function readProjectUpdates(projectId: string): Promise<UpdateAttributes[]> {
  return await UpdateModel.namedQuery<UpdateAttributes>(
    'test_read_project_updates',
    SQL`SELECT * FROM ${table(UpdateModel)} WHERE project_id = ${projectId}`
  )
}

export async function readPendingUpdates(projectId: string): Promise<UpdateAttributes[]> {
  const updates = await readProjectUpdates(projectId)
  return updates.filter((update) => update.status === UpdateStatus.Pending)
}

export async function readProjectRow(projectId: string): Promise<ProjectRow | undefined> {
  const rows = await ProjectModel.namedQuery<ProjectRow>(
    'test_read_project_row',
    SQL`SELECT status, updated_at FROM ${table(ProjectModel)} WHERE id = ${projectId}`
  )
  return rows[0]
}
