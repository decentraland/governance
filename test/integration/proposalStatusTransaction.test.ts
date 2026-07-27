import { randomUUID } from 'crypto'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { ProjectStatus } from '../../src/entities/Grant/types'
import ProposalModel from '../../src/entities/Proposal/model'
import { createTestProposal } from '../../src/entities/Proposal/testHelpers'
import {
  ProposalAttributes,
  ProposalStatus,
  ProposalType,
  ProposalWithProject,
} from '../../src/entities/Proposal/types'
import UpdateModel from '../../src/entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../../src/entities/Updates/types'
import ProjectModel from '../../src/models/Project'
import { ProjectService } from '../../src/services/ProjectService'
import { ProposalService } from '../../src/services/ProposalService'
import { VestingService } from '../../src/services/VestingService'
import { closeTransactionPool, withTransaction } from '../../src/utils/withTransaction'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'

// Keep the enact path off the network; the DB writes still hit the real test database.
jest.mock('../../src/services/VestingService', () => ({
  VestingService: {
    getVestingWithLogs: jest.fn(),
  },
}))

jest.mock('../../src/services/ProjectService', () => ({
  ProjectService: {
    getUpdatedProject: jest.fn(),
  },
}))

jest.mock('../../src/services/DiscourseService', () => ({
  DiscourseService: {
    commentUpdatedProposal: jest.fn(),
  },
}))

jest.mock('../../src/services/notification', () => ({
  NotificationService: {
    projectProposalEnacted: jest.fn(),
  },
}))

jest.mock('../../src/services/events', () => ({
  EventsService: {
    projectEnacted: jest.fn(),
  },
}))

const VESTING_ADDRESS = '0x1111111111111111111111111111111111111111'

// A ~3-month vesting so UpdateService.getAmountOfUpdates yields 3 pending updates.
const VESTING_WITH_LOGS = {
  start_at: '2020-01-01 00:00:00z',
  finish_at: '2020-03-31 00:00:00z',
}

async function insertProposal(status: ProposalStatus): Promise<ProposalAttributes> {
  const proposal = createTestProposal(ProposalType.Grant, status, 10000)
  await ProposalModel.create({
    ...proposal,
    // Match the production insert (ProposalService.saveToDb) which stores these as JSON strings.
    configuration: JSON.stringify(proposal.configuration),
    snapshot_proposal: JSON.stringify(proposal.snapshot_proposal),
  } as never)
  return proposal
}

async function insertProject(proposalId: string): Promise<string> {
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

async function insertUpdate(proposalId: string, projectId: string, status: UpdateStatus): Promise<UpdateAttributes> {
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

async function readProposalStatus(id: string): Promise<string | undefined> {
  const rows = await ProposalModel.namedQuery<{ status: string }>(
    'test_read_proposal_status',
    SQL`SELECT status FROM ${table(ProposalModel)} WHERE id = ${id}`
  )
  return rows[0]?.status
}

async function readProjectUpdates(projectId: string): Promise<UpdateAttributes[]> {
  return await UpdateModel.namedQuery<UpdateAttributes>(
    'test_read_project_updates',
    SQL`SELECT * FROM ${table(UpdateModel)} WHERE project_id = ${projectId}`
  )
}

describe('proposal status transaction', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTransactionPool()
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
    jest.clearAllMocks()
  })

  describe('withTransaction', () => {
    let proposal: ProposalAttributes

    beforeEach(async () => {
      proposal = await insertProposal(ProposalStatus.Passed)
    })

    describe('when the callback resolves', () => {
      beforeEach(async () => {
        await withTransaction(async (client) => {
          const query = ProposalModel.getUpdateQuery(
            { status: ProposalStatus.Rejected, updated_at: new Date() },
            { id: proposal.id }
          )
          await client.query(query.text, query.values)
        })
      })

      it('should commit the writes made inside it', async () => {
        expect(await readProposalStatus(proposal.id)).toBe(ProposalStatus.Rejected)
      })
    })

    describe('when the callback throws', () => {
      beforeEach(async () => {
        await withTransaction(async (client) => {
          const query = ProposalModel.getUpdateQuery(
            { status: ProposalStatus.Rejected, updated_at: new Date() },
            { id: proposal.id }
          )
          await client.query(query.text, query.values)
          throw new Error('forced failure')
        }).catch(() => undefined)
      })

      it('should roll back every write made inside it', async () => {
        expect(await readProposalStatus(proposal.id)).toBe(ProposalStatus.Passed)
      })
    })
  })

  describe('UpdateModel.replacePendingUpdates', () => {
    let proposalId: string
    let projectId: string
    let doneUpdate: UpdateAttributes

    beforeEach(async () => {
      const proposal = await insertProposal(ProposalStatus.Enacted)
      proposalId = proposal.id
      projectId = await insertProject(proposalId)
      await insertUpdate(proposalId, projectId, UpdateStatus.Pending)
      await insertUpdate(proposalId, projectId, UpdateStatus.Pending)
      doneUpdate = await insertUpdate(proposalId, projectId, UpdateStatus.Done)
    })

    describe('when replacing with a new set of updates', () => {
      let newUpdate: UpdateAttributes
      let stored: UpdateAttributes[]

      beforeEach(async () => {
        newUpdate = {
          id: randomUUID(),
          proposal_id: proposalId,
          project_id: projectId,
          status: UpdateStatus.Pending,
          due_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        }
        await UpdateModel.replacePendingUpdates(projectId, [newUpdate])
        stored = await readProjectUpdates(projectId)
      })

      it('should remove the previous pending updates', () => {
        const pendingIds = stored.filter((u) => u.status === UpdateStatus.Pending).map((u) => u.id)
        expect(pendingIds).toEqual([newUpdate.id])
      })

      it('should keep updates in other statuses untouched', () => {
        expect(stored.map((u) => u.id)).toContain(doneUpdate.id)
      })
    })

    describe('when replacing with an empty set', () => {
      let stored: UpdateAttributes[]

      beforeEach(async () => {
        await UpdateModel.replacePendingUpdates(projectId, [])
        stored = await readProjectUpdates(projectId)
      })

      it('should remove all pending updates', () => {
        expect(stored.filter((u) => u.status === UpdateStatus.Pending)).toHaveLength(0)
      })

      it('should keep updates in other statuses untouched', () => {
        expect(stored.map((u) => u.id)).toEqual([doneUpdate.id])
      })
    })
  })

  describe('ProposalService.updateProposalStatus', () => {
    const user = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'

    beforeEach(() => {
      ;(VestingService.getVestingWithLogs as jest.Mock).mockResolvedValue(VESTING_WITH_LOGS)
    })

    describe('when enacting a passed project proposal', () => {
      let proposal: ProposalWithProject
      let projectId: string

      beforeEach(async () => {
        const stored = await insertProposal(ProposalStatus.Passed)
        projectId = await insertProject(stored.id)
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({
          id: projectId,
          proposal_id: stored.id,
          status: ProjectStatus.InProgress,
          vesting_addresses: [VESTING_ADDRESS],
        })
        proposal = { ...stored, project_id: projectId, personnel: [] } as ProposalWithProject

        await ProposalService.updateProposalStatus(
          proposal,
          { status: ProposalStatus.Enacted, vesting_addresses: [VESTING_ADDRESS] },
          user
        )
      })

      it('should persist the enacted status', async () => {
        expect(await readProposalStatus(proposal.id)).toBe(ProposalStatus.Enacted)
      })

      it('should create the pending vesting updates', async () => {
        const updates = await readProjectUpdates(projectId)
        expect(updates.filter((u) => u.status === UpdateStatus.Pending)).toHaveLength(3)
      })
    })

    describe('when the proposal was concurrently moved off the status we read', () => {
      let proposal: ProposalWithProject
      let projectId: string
      let outcome: unknown

      beforeEach(async () => {
        const stored = await insertProposal(ProposalStatus.Passed)
        projectId = await insertProject(stored.id)
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({
          id: projectId,
          proposal_id: stored.id,
          status: ProjectStatus.InProgress,
          vesting_addresses: [VESTING_ADDRESS],
        })
        // A concurrent request already enacted the row before we commit.
        await ProposalModel.update<ProposalAttributes>({ status: ProposalStatus.Enacted }, { id: stored.id })
        // We still hold the stale Passed status we read earlier.
        proposal = { ...stored, project_id: projectId, personnel: [] } as ProposalWithProject

        outcome = await ProposalService.updateProposalStatus(
          proposal,
          { status: ProposalStatus.Enacted, vesting_addresses: [VESTING_ADDRESS] },
          user
        ).catch((error) => error)
      })

      it('should reject the update', () => {
        expect(outcome).toBeInstanceOf(Error)
      })

      it('should leave the winning status untouched', async () => {
        expect(await readProposalStatus(proposal.id)).toBe(ProposalStatus.Enacted)
      })

      it('should not create any pending updates', async () => {
        expect(await readProjectUpdates(projectId)).toHaveLength(0)
      })
    })
  })
})
