import { randomUUID } from 'crypto'

import ProposalModel from '../../src/entities/Proposal/model'
import { ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import { ProposalService } from '../../src/services/ProposalService'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertProject, insertProposalWith, readProposalStatus } from '../setup/factories'

// ProposalService pulls in the notification, discourse, discord and badge stack at import. None of
// it is needed here and leaving it real makes this suite tens of times slower, so it is stubbed the
// way the other proposal integration suite does it. The database work stays real.
jest.mock('../../src/services/DiscourseService', () => ({ DiscourseService: {} }))
jest.mock('../../src/services/notification', () => ({ NotificationService: {} }))
jest.mock('../../src/services/discord', () => ({ DiscordService: {} }))
jest.mock('../../src/services/BadgesService', () => ({ BadgesService: {} }))
jest.mock('../../src/services/events', () => ({ EventsService: {} }))
jest.mock('../../src/services/VestingService', () => ({ VestingService: {} }))
jest.mock('../../src/services/ProjectService', () => ({ ProjectService: {} }))
jest.mock('../../src/services/SnapshotService', () => ({ SnapshotService: {} }))
jest.mock('../../src/services/BudgetService', () => ({ BudgetService: {} }))

// Production proposal ids are uuids; the shared test helper builds readable ones instead, and
// getFinishProposalQuery filters on isUUID, so these tests supply real uuids.
function proposalId(): string {
  return randomUUID()
}

async function runFinishQuery(ids: string[], status: ProposalStatus): Promise<number | null> {
  const query = ProposalModel.getFinishProposalQuery(ids, status)
  if (query === null) {
    return null
  }
  return await ProposalModel.namedRowCount('test_finish_proposals', query)
}

describe('finishing proposals', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('getFinishProposalQuery', () => {
    describe('when the id list is empty', () => {
      it('should build no query at all', () => {
        expect(ProposalModel.getFinishProposalQuery([], ProposalStatus.Passed)).toBeNull()
      })
    })

    // The ids come from the finish job's own read, but the filter is what keeps a malformed one out
    // of the statement, and building an IN () with nothing in it would be a syntax error.
    describe('when no id in the list is a uuid', () => {
      it('should build no query', () => {
        expect(ProposalModel.getFinishProposalQuery(['not-a-uuid', ''], ProposalStatus.Passed)).toBeNull()
      })
    })

    describe('when the list mixes valid and malformed ids', () => {
      let active: string
      let updated: number | null

      beforeEach(async () => {
        active = proposalId()
        await insertProposalWith({ id: active, status: ProposalStatus.Active })
        updated = await runFinishQuery([active, 'not-a-uuid'], ProposalStatus.Passed)
      })

      it('should still update the valid one', async () => {
        expect(await readProposalStatus(active)).toBe(ProposalStatus.Passed)
      })

      it('should report a single row updated', () => {
        expect(updated).toBe(1)
      })
    })

    describe('when the listed proposals are active', () => {
      let first: string
      let second: string

      beforeEach(async () => {
        first = proposalId()
        second = proposalId()
        await insertProposalWith({ id: first, status: ProposalStatus.Active })
        await insertProposalWith({ id: second, status: ProposalStatus.Active })
        await runFinishQuery([first, second], ProposalStatus.Rejected)
      })

      it('should move the first to the new status', async () => {
        expect(await readProposalStatus(first)).toBe(ProposalStatus.Rejected)
      })

      it('should move the second to the new status', async () => {
        expect(await readProposalStatus(second)).toBe(ProposalStatus.Rejected)
      })
    })

    describe('when a listed proposal is already resolved', () => {
      let alreadyPassed: string

      beforeEach(async () => {
        alreadyPassed = proposalId()
        await insertProposalWith({ id: alreadyPassed, status: ProposalStatus.Passed })
        await runFinishQuery([alreadyPassed], ProposalStatus.Rejected)
      })

      // Only active proposals may be finished, so a second run cannot rewrite an outcome.
      it('should leave its status untouched', async () => {
        expect(await readProposalStatus(alreadyPassed)).toBe(ProposalStatus.Passed)
      })
    })

    describe('when a listed proposal has been deleted', () => {
      let deleted: string

      beforeEach(async () => {
        deleted = proposalId()
        await insertProposalWith({ id: deleted, status: ProposalStatus.Active, deleted: true })
        await runFinishQuery([deleted], ProposalStatus.Passed)
      })

      it('should not resurrect it into a finished status', async () => {
        expect(await readProposalStatus(deleted)).toBe(ProposalStatus.Active)
      })
    })

    describe('when an active proposal is not on the list', () => {
      let listed: string
      let unlisted: string

      beforeEach(async () => {
        listed = proposalId()
        unlisted = proposalId()
        await insertProposalWith({ id: listed, status: ProposalStatus.Active })
        await insertProposalWith({ id: unlisted, status: ProposalStatus.Active })
        await runFinishQuery([listed], ProposalStatus.Passed)
      })

      it('should leave it active', async () => {
        expect(await readProposalStatus(unlisted)).toBe(ProposalStatus.Active)
      })
    })
  })

  describe('ProposalService.getFinishProposalQueries', () => {
    describe('when proposals finish with different outcomes', () => {
      let passing: string
      let rejecting: string

      beforeEach(async () => {
        passing = proposalId()
        rejecting = proposalId()
        await insertProposalWith({ id: passing, status: ProposalStatus.Active })
        await insertProposalWith({ id: rejecting, status: ProposalStatus.Active })
        const queries = ProposalService.getFinishProposalQueries([
          { id: passing, newStatus: ProposalStatus.Passed },
          { id: rejecting, newStatus: ProposalStatus.Rejected },
        ] as never)
        for (const query of queries) {
          await ProposalModel.namedRowCount('test_finish_grouped', query)
        }
      })

      it('should build one statement per outcome', () => {
        const queries = ProposalService.getFinishProposalQueries([
          { id: passing, newStatus: ProposalStatus.Passed },
          { id: rejecting, newStatus: ProposalStatus.Rejected },
        ] as never)
        expect(queries).toHaveLength(2)
      })

      it('should apply the passing outcome', async () => {
        expect(await readProposalStatus(passing)).toBe(ProposalStatus.Passed)
      })

      it('should apply the rejecting outcome', async () => {
        expect(await readProposalStatus(rejecting)).toBe(ProposalStatus.Rejected)
      })
    })

    describe('when no proposal has a finishable outcome', () => {
      it('should build no statements', () => {
        expect(ProposalService.getFinishProposalQueries([])).toEqual([])
      })
    })
  })

  describe('ProposalService.getProposal', () => {
    describe('when the proposal exists', () => {
      let stored: string
      let found: Awaited<ReturnType<typeof ProposalService.getProposal>>

      beforeEach(async () => {
        stored = (
          await insertProposalWith({ id: proposalId(), type: ProposalType.Poll, status: ProposalStatus.Active })
        ).id
        found = await ProposalService.getProposal(stored)
      })

      it('should return it', () => {
        expect(found.id).toBe(stored)
      })

      it('should parse the stored configuration back into an object', () => {
        expect(typeof found.configuration).toBe('object')
      })
    })

    describe('when the proposal was deleted', () => {
      let outcome: unknown

      beforeEach(async () => {
        const deleted = await insertProposalWith({ id: proposalId(), deleted: true })
        outcome = await ProposalService.getProposal(deleted.id).catch((error) => error)
      })

      it('should behave as though it does not exist', () => {
        expect(outcome).toBeInstanceOf(Error)
      })
    })

    describe('when the proposal does not exist', () => {
      let outcome: unknown

      beforeEach(async () => {
        outcome = await ProposalService.getProposal(proposalId()).catch((error) => error)
      })

      it('should raise a not found error', () => {
        expect(outcome).toBeInstanceOf(Error)
      })
    })
  })

  describe('ProposalService.getProposalWithProject', () => {
    describe('when the proposal has a project', () => {
      let stored: string
      let projectId: string
      let found: Awaited<ReturnType<typeof ProposalService.getProposalWithProject>>

      beforeEach(async () => {
        stored = (
          await insertProposalWith({ id: proposalId(), type: ProposalType.Grant, status: ProposalStatus.Enacted })
        ).id
        projectId = await insertProject(stored)
        found = await ProposalService.getProposalWithProject(stored)
      })

      it('should return the proposal', () => {
        expect(found.id).toBe(stored)
      })

      it('should attach the project id', () => {
        expect(found.project_id).toBe(projectId)
      })
    })

    describe('when the proposal has no project', () => {
      let stored: string
      let found: Awaited<ReturnType<typeof ProposalService.getProposalWithProject>>

      beforeEach(async () => {
        stored = (
          await insertProposalWith({ id: proposalId(), type: ProposalType.Poll, status: ProposalStatus.Active })
        ).id
        found = await ProposalService.getProposalWithProject(stored)
      })

      it('should still return the proposal', () => {
        expect(found.id).toBe(stored)
      })

      it('should leave the project id unset', () => {
        expect(found.project_id).toBeFalsy()
      })
    })

    describe('when the proposal does not exist', () => {
      let outcome: unknown

      beforeEach(async () => {
        outcome = await ProposalService.getProposalWithProject(proposalId()).catch((error) => error)
      })

      it('should raise a not found error', () => {
        expect(outcome).toBeInstanceOf(Error)
      })
    })
  })
})
