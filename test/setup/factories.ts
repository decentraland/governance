import { randomUUID } from 'crypto'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { ProjectStatus } from '../../src/entities/Grant/types'
import ProposalModel from '../../src/entities/Proposal/model'
import { createTestProposal } from '../../src/entities/Proposal/testHelpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import UpdateModel from '../../src/entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../../src/entities/Updates/types'
import ProjectModel from '../../src/models/Project'

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

export async function readProposalStatus(id: string): Promise<string | undefined> {
  const rows = await ProposalModel.namedQuery<{ status: string }>(
    'test_read_proposal_status',
    SQL`SELECT status FROM ${table(ProposalModel)} WHERE id = ${id}`
  )
  return rows[0]?.status
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
