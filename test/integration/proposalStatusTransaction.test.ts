import { randomUUID } from 'crypto'

import { ProjectStatus } from '../../src/entities/Grant/types'
import ProposalModel from '../../src/entities/Proposal/model'
import { ProposalAttributes, ProposalStatus, ProposalWithProject } from '../../src/entities/Proposal/types'
import UpdateModel from '../../src/entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../../src/entities/Updates/types'
import { DiscourseService } from '../../src/services/DiscourseService'
import { ProjectService } from '../../src/services/ProjectService'
import { ProposalService } from '../../src/services/ProposalService'
import { VestingService } from '../../src/services/VestingService'
import { EventsService } from '../../src/services/events'
import { NotificationService } from '../../src/services/notification'
import { closeTransactionPool, withTransaction } from '../../src/utils/withTransaction'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import {
  insertProject,
  insertProposal,
  insertUpdate,
  readPendingUpdates,
  readProjectUpdates,
  readProposalStatus,
} from '../setup/factories'

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
const SECOND_VESTING_ADDRESS = '0x2222222222222222222222222222222222222222'

// A ~3-month vesting so UpdateService.getAmountOfUpdates yields 3 pending updates.
const VESTING_WITH_LOGS = {
  start_at: '2020-01-01 00:00:00z',
  finish_at: '2020-03-31 00:00:00z',
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

    describe('when the callback wrote to more than one table before throwing', () => {
      let projectId: string

      beforeEach(async () => {
        projectId = await insertProject(proposal.id)
        await withTransaction(async (client) => {
          const statusQuery = ProposalModel.getUpdateQuery(
            { status: ProposalStatus.Enacted, updated_at: new Date() },
            { id: proposal.id }
          )
          await client.query(statusQuery.text, statusQuery.values)

          const replaceQuery = UpdateModel.getReplacePendingUpdatesQuery(projectId, [
            {
              id: randomUUID(),
              proposal_id: proposal.id,
              project_id: projectId,
              status: UpdateStatus.Pending,
              due_date: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
            },
          ])
          await client.query(replaceQuery.text, replaceQuery.values)

          throw new Error('forced failure')
        }).catch(() => undefined)
      })

      it('should roll back the proposal status write', async () => {
        expect(await readProposalStatus(proposal.id)).toBe(ProposalStatus.Passed)
      })

      it('should roll back the pending update write', async () => {
        expect(await readProjectUpdates(projectId)).toHaveLength(0)
      })
    })

    describe('when an earlier transaction on the pool already failed', () => {
      beforeEach(async () => {
        await withTransaction(async () => {
          throw new Error('forced failure')
        }).catch(() => undefined)

        await withTransaction(async (client) => {
          const query = ProposalModel.getUpdateQuery(
            { status: ProposalStatus.Rejected, updated_at: new Date() },
            { id: proposal.id }
          )
          await client.query(query.text, query.values)
        })
      })

      it('should still commit the next transaction, so the rollback left no unusable connection', async () => {
        expect(await readProposalStatus(proposal.id)).toBe(ProposalStatus.Rejected)
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

    describe('when two council actions race on the same proposal', () => {
      let proposal: ProposalWithProject
      let projectId: string
      let attempts: { target: ProposalStatus; update: Record<string, unknown> }[]
      let outcomes: PromiseSettledResult<unknown>[]
      let winner: ProposalStatus | undefined
      let storedStatus: string | undefined

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

        // Both requests read the same Passed status and commit against a real row lock.
        attempts = [
          {
            target: ProposalStatus.Enacted,
            update: { status: ProposalStatus.Enacted, vesting_addresses: [VESTING_ADDRESS] },
          },
          { target: ProposalStatus.Rejected, update: { status: ProposalStatus.Rejected } },
        ]
        outcomes = await Promise.allSettled(
          attempts.map((attempt) => ProposalService.updateProposalStatus(proposal, attempt.update as never, user))
        )
        winner = attempts[outcomes.findIndex((outcome) => outcome.status === 'fulfilled')]?.target
        storedStatus = await readProposalStatus(proposal.id)
      })

      it('should let exactly one of the two transitions succeed', () => {
        expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1)
      })

      it('should store the status of the transition that succeeded', () => {
        expect(storedStatus).toBe(winner)
      })

      it('should reject the losing transition with an error', () => {
        const rejected = outcomes.find((outcome) => outcome.status === 'rejected') as PromiseRejectedResult
        expect(rejected.reason).toBeInstanceOf(Error)
      })

      it('should keep the pending updates consistent with the stored status', async () => {
        const expectedPendingUpdates = storedStatus === ProposalStatus.Enacted ? 3 : 0
        expect(await readPendingUpdates(projectId)).toHaveLength(expectedPendingUpdates)
      })
    })

    describe('when re-enacting a proposal that is already enacted', () => {
      let proposal: ProposalWithProject
      let projectId: string
      let existingPendingUpdate: UpdateAttributes

      beforeEach(async () => {
        const stored = await insertProposal(ProposalStatus.Enacted, [VESTING_ADDRESS])
        projectId = await insertProject(stored.id)
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({
          id: projectId,
          proposal_id: stored.id,
          status: ProjectStatus.InProgress,
          vesting_addresses: [VESTING_ADDRESS],
        })
        existingPendingUpdate = await insertUpdate(stored.id, projectId, UpdateStatus.Pending)
        proposal = { ...stored, project_id: projectId, personnel: [] } as ProposalWithProject
      })

      describe('and the vesting addresses have not changed', () => {
        beforeEach(async () => {
          await ProposalService.updateProposalStatus(
            proposal,
            { status: ProposalStatus.Enacted, vesting_addresses: [VESTING_ADDRESS] },
            user
          )
        })

        it('should keep the existing pending update rather than regenerating the schedule', async () => {
          const pending = await readPendingUpdates(projectId)
          expect(pending.map((update) => update.id)).toEqual([existingPendingUpdate.id])
        })

        // Re-enacting changes nothing, and none of these are idempotent, so an accidental double
        // submit would announce the same enactment twice.
        it('should not notify anyone a second time', () => {
          expect(NotificationService.projectProposalEnacted).not.toHaveBeenCalled()
        })

        it('should not record a second enactment event', () => {
          expect(EventsService.projectEnacted).not.toHaveBeenCalled()
        })

        it('should not post a second comment to the forum', () => {
          expect(DiscourseService.commentUpdatedProposal).not.toHaveBeenCalled()
        })
      })

      // The schedule is built from the last vesting address, so a reordered list points at a
      // different vesting contract even though the set is identical.
      describe('and the vesting addresses are the same set in a different order', () => {
        beforeEach(async () => {
          const stored = await insertProposal(ProposalStatus.Enacted, [VESTING_ADDRESS, SECOND_VESTING_ADDRESS])
          const reorderedProjectId = await insertProject(stored.id)
          ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({
            id: reorderedProjectId,
            proposal_id: stored.id,
            status: ProjectStatus.InProgress,
            vesting_addresses: [VESTING_ADDRESS, SECOND_VESTING_ADDRESS],
          })
          existingPendingUpdate = await insertUpdate(stored.id, reorderedProjectId, UpdateStatus.Pending)
          projectId = reorderedProjectId
          proposal = { ...stored, project_id: reorderedProjectId, personnel: [] } as ProposalWithProject

          await ProposalService.updateProposalStatus(
            proposal,
            { status: ProposalStatus.Enacted, vesting_addresses: [SECOND_VESTING_ADDRESS, VESTING_ADDRESS] },
            user
          )
        })

        it('should regenerate the schedule, since the latest vesting is now a different contract', async () => {
          expect(await readPendingUpdates(projectId)).toHaveLength(3)
        })

        it('should not leave the previous schedule in place', async () => {
          const pending = await readPendingUpdates(projectId)
          expect(pending.map((update) => update.id)).not.toContain(existingPendingUpdate.id)
        })

        it('should build the schedule from the address the proposal now records as latest', () => {
          expect(VestingService.getVestingWithLogs).toHaveBeenCalledWith(VESTING_ADDRESS, expect.anything())
        })
      })

      describe('and the vesting addresses changed', () => {
        beforeEach(async () => {
          await ProposalService.updateProposalStatus(
            proposal,
            { status: ProposalStatus.Enacted, vesting_addresses: [VESTING_ADDRESS, SECOND_VESTING_ADDRESS] },
            user
          )
        })

        it('should replace the previous pending update', async () => {
          const pending = await readPendingUpdates(projectId)
          expect(pending.map((update) => update.id)).not.toContain(existingPendingUpdate.id)
        })

        it('should regenerate the schedule from the new vesting', async () => {
          expect(await readPendingUpdates(projectId)).toHaveLength(3)
        })
      })
    })
  })
})
