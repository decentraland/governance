import { randomUUID } from 'crypto'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { NewGrantCategory, SubtypeAlternativeOptions, SubtypeOptions } from '../../src/entities/Grant/types'
import ProposalModel from '../../src/entities/Proposal/model'
import { ProposalStatus, ProposalType, SortingOrder } from '../../src/entities/Proposal/types'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertProposalWith } from '../setup/factories'

const AUTHOR = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
const OTHER_AUTHOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'

// getProposalTotal and getProposalList build their SQL from the same filter set, so each case
// asserts both: a filter that silently stops narrowing is as wrong as one that throws.
async function listAndTotal(filter: Parameters<typeof ProposalModel.getProposalList>[0]) {
  const [list, total] = await Promise.all([
    ProposalModel.getProposalList(filter),
    ProposalModel.getProposalTotal(filter),
  ])
  return { ids: list.map((proposal) => proposal.id), total }
}

async function setTextSearch(id: string, text: string): Promise<void> {
  await ProposalModel.namedQuery(
    'test_set_textsearch',
    SQL`UPDATE ${table(ProposalModel)} SET textsearch = to_tsvector('english', ${text}) WHERE id = ${id}`
  )
}

describe('proposal queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('when proposals of several types and authors exist', () => {
    let grantByAuthor: string
    let pollByAuthor: string
    let pollByOther: string
    let deletedProposal: string

    beforeEach(async () => {
      grantByAuthor = (await insertProposalWith({ type: ProposalType.Grant, user: AUTHOR })).id
      pollByAuthor = (await insertProposalWith({ type: ProposalType.Poll, user: AUTHOR })).id
      pollByOther = (
        await insertProposalWith({ type: ProposalType.Poll, user: OTHER_AUTHOR, status: ProposalStatus.Passed })
      ).id
      deletedProposal = (await insertProposalWith({ type: ProposalType.Poll, user: AUTHOR, deleted: true })).id
    })

    describe('and no filter is applied', () => {
      it('should return every proposal that is not deleted', async () => {
        const { ids } = await listAndTotal({})
        expect(ids.sort()).toEqual([grantByAuthor, pollByAuthor, pollByOther].sort())
      })

      it('should exclude the deleted proposal from the total', async () => {
        const { total } = await listAndTotal({})
        expect(total).toBe(3)
      })

      it('should never return a deleted proposal', async () => {
        const { ids } = await listAndTotal({})
        expect(ids).not.toContain(deletedProposal)
      })
    })

    describe('and the type is filtered', () => {
      it('should return only proposals of that type', async () => {
        const { ids } = await listAndTotal({ type: ProposalType.Poll })
        expect(ids.sort()).toEqual([pollByAuthor, pollByOther].sort())
      })

      it('should count only proposals of that type', async () => {
        const { total } = await listAndTotal({ type: ProposalType.Poll })
        expect(total).toBe(2)
      })
    })

    describe('and the status is filtered', () => {
      it('should return only proposals in that status', async () => {
        const { ids } = await listAndTotal({ status: ProposalStatus.Passed })
        expect(ids).toEqual([pollByOther])
      })
    })

    describe('and the author is filtered', () => {
      it('should return only that author’s proposals', async () => {
        const { ids } = await listAndTotal({ user: AUTHOR })
        expect(ids.sort()).toEqual([grantByAuthor, pollByAuthor].sort())
      })

      it('should count only that author’s proposals', async () => {
        const { total } = await listAndTotal({ user: AUTHOR })
        expect(total).toBe(2)
      })
    })

    describe('and the type is combined with the author', () => {
      it('should apply both filters', async () => {
        const { ids } = await listAndTotal({ user: AUTHOR, type: ProposalType.Poll })
        expect(ids).toEqual([pollByAuthor])
      })
    })

    // Each of these is rejected before the query runs. A filter that fell through instead of
    // returning nothing would silently widen the result set to every proposal.
    describe('and a filter value is not valid', () => {
      it('should return nothing for an author that is not an address', async () => {
        expect(await listAndTotal({ user: 'not-an-address' })).toEqual({ ids: [], total: 0 })
      })

      it('should return nothing for an unknown type', async () => {
        expect(await listAndTotal({ type: 'not-a-type' as ProposalType })).toEqual({ ids: [], total: 0 })
      })

      it('should return nothing for an unknown status', async () => {
        expect(await listAndTotal({ status: 'not-a-status' as ProposalStatus })).toEqual({ ids: [], total: 0 })
      })

      it('should return nothing for an unknown timeframe key', async () => {
        expect(await listAndTotal({ timeFrame: 'week', timeFrameKey: 'deleted_at' })).toEqual({ ids: [], total: 0 })
      })

      it('should return nothing for an unknown sort direction', async () => {
        expect(await ProposalModel.getProposalList({ order: 'DROP TABLE' as SortingOrder })).toEqual([])
      })
    })

    // getSubtypeQuery and getLinkedProposalQuery interpolate with SQL.raw, so the allow-list and
    // uuid checks in front of them are the only thing keeping caller input out of the statement.
    describe('and a filter that reaches a raw sql fragment is not valid', () => {
      it('should reject a subtype that is not a known grant category', async () => {
        expect(await listAndTotal({ subtype: 'not-a-category' as SubtypeOptions })).toEqual({ ids: [], total: 0 })
      })

      // The payload closes the json string and the sql literal, then comments out the fragment's
      // trailing characters so `OR TRUE` survives. Without the allow-list in front of SQL.raw this
      // matches every proposal, so an empty result is what proves the guard is load-bearing.
      it('should reject a subtype carrying a sql payload that would otherwise match everything', async () => {
        expect(await listAndTotal({ subtype: `x"}' OR TRUE --` as SubtypeOptions })).toEqual({ ids: [], total: 0 })
      })

      it('should reject a linked proposal id that is not a uuid', async () => {
        expect(await listAndTotal({ linkedProposalId: 'not-a-uuid' })).toEqual({ ids: [], total: 0 })
      })

      it('should reject a linked proposal id carrying a sql payload that would otherwise match everything', async () => {
        expect(await listAndTotal({ linkedProposalId: `x"}' OR TRUE --` })).toEqual({ ids: [], total: 0 })
      })
    })

    describe('and pagination is applied', () => {
      it('should return at most the requested number of proposals', async () => {
        const { ids } = await listAndTotal({ limit: 2 })
        expect(ids).toHaveLength(2)
      })

      it('should skip the requested number of proposals', async () => {
        const first = await ProposalModel.getProposalList({ limit: 3 })
        const skipped = await ProposalModel.getProposalList({ limit: 3, offset: 1 })
        expect(skipped.map((p) => p.id)).toEqual(first.slice(1).map((p) => p.id))
      })

      it('should leave the total unaffected by the page size', async () => {
        const { total } = await listAndTotal({ limit: 1 })
        expect(total).toBe(3)
      })
    })
  })

  describe('when proposals were created at different times', () => {
    let oldest: string
    let newest: string

    beforeEach(async () => {
      // Relative to now, so the timeframe window stays meaningful as the calendar moves on.
      oldest = (await insertProposalWith({ created_at: new Date('2020-01-01T00:00:00.000Z') })).id
      newest = (await insertProposalWith({ created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) })).id
    })

    describe('and no order is given', () => {
      it('should return the newest first', async () => {
        const list = await ProposalModel.getProposalList({})
        expect(list[0].id).toBe(newest)
      })
    })

    describe('and ascending order is requested', () => {
      it('should return the oldest first', async () => {
        const list = await ProposalModel.getProposalList({ order: SortingOrder.ASC })
        expect(list[0].id).toBe(oldest)
      })
    })

    describe('and a created_at timeframe is applied', () => {
      it('should exclude proposals older than the window', async () => {
        const { ids } = await listAndTotal({ timeFrame: 'week', timeFrameKey: 'created_at' })
        expect(ids).toEqual([newest])
      })
    })
  })

  describe('when proposals finish at different times', () => {
    let finishingSoon: string
    let finishedAlready: string

    beforeEach(async () => {
      finishingSoon = (await insertProposalWith({ finish_at: new Date(Date.now() + 24 * 60 * 60 * 1000) })).id
      finishedAlready = (await insertProposalWith({ finish_at: new Date('2020-01-01T00:00:00.000Z') })).id
    })

    describe('and a finish_at timeframe is applied', () => {
      it('should return only proposals still to finish inside the window', async () => {
        const { ids } = await listAndTotal({ timeFrame: '2days', timeFrameKey: 'finish_at' })
        expect(ids).toEqual([finishingSoon])
      })

      it('should exclude proposals that already finished', async () => {
        const { ids } = await listAndTotal({ timeFrame: '2days', timeFrameKey: 'finish_at' })
        expect(ids).not.toContain(finishedAlready)
      })
    })
  })

  describe('when a snapshot id filter is applied', () => {
    let first: string
    let second: string

    beforeEach(async () => {
      first = (await insertProposalWith({ snapshot_id: 'snapshot-one' })).id
      second = (await insertProposalWith({ snapshot_id: 'snapshot-two' })).id
      await insertProposalWith({ snapshot_id: 'snapshot-three' })
    })

    it('should return only the proposals with those snapshot ids', async () => {
      const { ids } = await listAndTotal({ snapshotIds: 'snapshot-one,snapshot-two' })
      expect(ids.sort()).toEqual([first, second].sort())
    })

    it('should count only those proposals', async () => {
      const { total } = await listAndTotal({ snapshotIds: 'snapshot-one,snapshot-two' })
      expect(total).toBe(2)
    })
  })

  describe('when a subtype filter is applied', () => {
    let acceleratorGrant: string

    beforeEach(async () => {
      acceleratorGrant = (
        await insertProposalWith({
          type: ProposalType.Grant,
          configuration: { category: NewGrantCategory.Accelerator },
        })
      ).id
      await insertProposalWith({ type: ProposalType.Grant, configuration: { category: NewGrantCategory.Platform } })
    })

    it('should return only grants in that category', async () => {
      const { ids } = await listAndTotal({ subtype: NewGrantCategory.Accelerator })
      expect(ids).toEqual([acceleratorGrant])
    })

    it('should accept the legacy alternative without erroring', async () => {
      const { total } = await listAndTotal({ subtype: SubtypeAlternativeOptions.Legacy })
      expect(total).toBe(0)
    })
  })

  describe('when a linked proposal filter is applied', () => {
    let linkedId: string
    let child: string

    beforeEach(async () => {
      linkedId = randomUUID()
      child = (await insertProposalWith({ configuration: { linked_proposal_id: linkedId } })).id
      await insertProposalWith({ configuration: { linked_proposal_id: randomUUID() } })
    })

    it('should return only the proposals linked to it', async () => {
      const { ids } = await listAndTotal({ linkedProposalId: linkedId })
      expect(ids).toEqual([child])
    })
  })

  describe('when a search term is applied', () => {
    let matching: string

    beforeEach(async () => {
      matching = (await insertProposalWith({})).id
      const other = await insertProposalWith({})
      await setTextSearch(matching, 'a proposal about playground infrastructure')
      await setTextSearch(other.id, 'an unrelated proposal about catalysts')
    })

    it('should return only proposals whose text matches', async () => {
      const { ids } = await listAndTotal({ search: 'playground' })
      expect(ids).toEqual([matching])
    })

    it('should count only matching proposals', async () => {
      const { total } = await listAndTotal({ search: 'playground' })
      expect(total).toBe(1)
    })

    it('should return nothing when the term matches no proposal', async () => {
      expect(await listAndTotal({ search: 'unmatchedterm' })).toEqual({ ids: [], total: 0 })
    })
  })

  describe('getFinishableProposals', () => {
    let dueActive: string
    let overdueActive: string

    beforeEach(async () => {
      dueActive = (
        await insertProposalWith({
          status: ProposalStatus.Active,
          finish_at: new Date(Date.now() + 30 * 1000),
          created_at: new Date('2024-01-02T00:00:00.000Z'),
        })
      ).id
      overdueActive = (
        await insertProposalWith({
          status: ProposalStatus.Active,
          finish_at: new Date('2020-01-01T00:00:00.000Z'),
          created_at: new Date('2024-01-01T00:00:00.000Z'),
        })
      ).id
      // Not finishable: still running, already finished by status, or deleted.
      await insertProposalWith({
        status: ProposalStatus.Active,
        finish_at: new Date(Date.now() + 60 * 60 * 1000),
      })
      await insertProposalWith({ status: ProposalStatus.Passed, finish_at: new Date('2020-01-01T00:00:00.000Z') })
      await insertProposalWith({
        status: ProposalStatus.Active,
        finish_at: new Date('2020-01-01T00:00:00.000Z'),
        deleted: true,
      })
    })

    it('should return the active proposals whose voting window has closed', async () => {
      const finishable = await ProposalModel.getFinishableProposals()
      expect(finishable.map((proposal) => proposal.id)).toEqual([overdueActive, dueActive])
    })

    it('should order them oldest first', async () => {
      const finishable = await ProposalModel.getFinishableProposals()
      expect(finishable[0].id).toBe(overdueActive)
    })

    it('should not return proposals that are still running or already resolved', async () => {
      const finishable = await ProposalModel.getFinishableProposals()
      expect(finishable).toHaveLength(2)
    })
  })
})
