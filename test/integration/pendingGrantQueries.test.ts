import { BUDGETING_START_DATE } from '../../src/entities/Grant/constants'
import ProposalModel from '../../src/entities/Proposal/model'
import { ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import UpdateModel from '../../src/entities/Updates/model'
import { UpdateStatus } from '../../src/entities/Updates/types'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertProject, insertProposalWith, insertUpdate } from '../setup/factories'

const AFTER_BUDGETING_STARTED = new Date(BUDGETING_START_DATE.getTime() + 24 * 60 * 60 * 1000)
const BEFORE_BUDGETING_STARTED = new Date(BUDGETING_START_DATE.getTime() - 24 * 60 * 60 * 1000)

describe('pending grant queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  // This selects the grants the budgeting system still has to account for, so every predicate
  // decides whether a grant is charged against a quarter budget.
  describe('getPendingNewGrants', () => {
    let eligible: string

    beforeEach(async () => {
      eligible = (
        await insertProposalWith({
          type: ProposalType.Grant,
          status: ProposalStatus.Passed,
          start_at: AFTER_BUDGETING_STARTED,
        })
      ).id
    })

    describe('and a passed grant started after budgeting began', () => {
      it('should return it', async () => {
        const pending = await ProposalModel.getPendingNewGrants()
        expect(pending.map((proposal) => proposal.id)).toEqual([eligible])
      })
    })

    describe('and a grant started before budgeting began', () => {
      beforeEach(async () => {
        await insertProposalWith({
          type: ProposalType.Grant,
          status: ProposalStatus.Passed,
          start_at: BEFORE_BUDGETING_STARTED,
        })
      })

      it('should leave the older grant out', async () => {
        const pending = await ProposalModel.getPendingNewGrants()
        expect(pending.map((proposal) => proposal.id)).toEqual([eligible])
      })
    })

    describe('and a grant has not passed', () => {
      beforeEach(async () => {
        await insertProposalWith({
          type: ProposalType.Grant,
          status: ProposalStatus.Active,
          start_at: AFTER_BUDGETING_STARTED,
        })
      })

      it('should leave it out until it does', async () => {
        const pending = await ProposalModel.getPendingNewGrants()
        expect(pending.map((proposal) => proposal.id)).toEqual([eligible])
      })
    })

    describe('and a passed proposal is not a grant', () => {
      beforeEach(async () => {
        await insertProposalWith({
          type: ProposalType.Poll,
          status: ProposalStatus.Passed,
          start_at: AFTER_BUDGETING_STARTED,
        })
      })

      it('should leave it out, since only grants draw budget', async () => {
        const pending = await ProposalModel.getPendingNewGrants()
        expect(pending.map((proposal) => proposal.id)).toEqual([eligible])
      })
    })

    describe('and a matching grant has been deleted', () => {
      beforeEach(async () => {
        await insertProposalWith({
          type: ProposalType.Grant,
          status: ProposalStatus.Passed,
          start_at: AFTER_BUDGETING_STARTED,
          deleted: true,
        })
      })

      it('should leave it out', async () => {
        const pending = await ProposalModel.getPendingNewGrants()
        expect(pending.map((proposal) => proposal.id)).toEqual([eligible])
      })
    })

    describe('and several grants are eligible', () => {
      let older: string

      beforeEach(async () => {
        older = (
          await insertProposalWith({
            type: ProposalType.Grant,
            status: ProposalStatus.Passed,
            start_at: AFTER_BUDGETING_STARTED,
            // Distinctly before the helper's default created_at, otherwise the two tie and the
            // ordering assertion becomes a coin flip.
            created_at: new Date('2023-01-15T00:00:00.000Z'),
          })
        ).id
      })

      it('should return the oldest first', async () => {
        const pending = await ProposalModel.getPendingNewGrants()
        expect(pending[0].id).toBe(older)
      })

      it('should return both', async () => {
        const pending = await ProposalModel.getPendingNewGrants()
        expect(pending).toHaveLength(2)
      })
    })
  })

  // Backfill query for updates whose forum post never got created.
  describe('getUpdatesWithoutForumPost', () => {
    let projectId: string
    let proposalId: string
    let missingPost: string

    beforeEach(async () => {
      const proposal = await insertProposalWith({ status: ProposalStatus.Enacted })
      proposalId = proposal.id
      projectId = await insertProject(proposalId)
      const update = await insertUpdate(proposalId, projectId, UpdateStatus.Done)
      missingPost = update.id
      await UpdateModel.update(
        { health: 'onTime', completion_date: new Date('2024-01-01T00:00:00.000Z'), discourse_topic_id: undefined },
        { id: missingPost }
      )
    })

    describe('and an update was completed without a forum post', () => {
      it('should return it', async () => {
        const found = await UpdateModel.getUpdatesWithoutForumPost()
        expect(found.map((update) => update.id)).toEqual([missingPost])
      })
    })

    describe('and the update already has a forum post', () => {
      beforeEach(async () => {
        await UpdateModel.update({ discourse_topic_id: 42 }, { id: missingPost })
      })

      it('should leave it out', async () => {
        expect(await UpdateModel.getUpdatesWithoutForumPost()).toEqual([])
      })
    })

    describe('and the update was never filled in', () => {
      beforeEach(async () => {
        await UpdateModel.update({ health: undefined }, { id: missingPost })
      })

      it('should leave it out, since there is nothing to post', async () => {
        expect(await UpdateModel.getUpdatesWithoutForumPost()).toEqual([])
      })
    })

    describe('and the update predates the backfill window', () => {
      beforeEach(async () => {
        await UpdateModel.update({ completion_date: new Date('2023-01-01T00:00:00.000Z') }, { id: missingPost })
      })

      it('should leave it out', async () => {
        expect(await UpdateModel.getUpdatesWithoutForumPost()).toEqual([])
      })
    })
  })
})
