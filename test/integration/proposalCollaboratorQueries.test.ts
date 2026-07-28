import { CoauthorStatus } from '../../src/entities/Coauthor/types'
import ProposalModel from '../../src/entities/Proposal/model'
import { ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertCoauthor, insertProposalWith, insertSubscription } from '../setup/factories'

const COAUTHOR = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
const AUTHOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const STRANGER = '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f'

const IN_THE_FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
const IN_THE_PAST = new Date('2020-01-01T00:00:00.000Z')

async function listAndTotal(filter: Parameters<typeof ProposalModel.getProposalList>[0]) {
  const [list, total] = await Promise.all([
    ProposalModel.getProposalList(filter),
    ProposalModel.getProposalTotal(filter),
  ])
  return { ids: list.map((proposal) => proposal.id), total }
}

describe('proposal collaborator queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  // With coauthor set, the author filter is replaced by a join on the coauthor address, so a
  // proposal the caller merely authored must not come back through this path.
  describe('when filtering by coauthor for a specific address', () => {
    describe('and the proposal is still open for voting', () => {
      let pendingInvite: string
      let approvedInvite: string

      beforeEach(async () => {
        pendingInvite = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_FUTURE })).id
        approvedInvite = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_FUTURE })).id
        await insertCoauthor(pendingInvite, COAUTHOR, CoauthorStatus.PENDING)
        await insertCoauthor(approvedInvite, COAUTHOR, CoauthorStatus.APPROVED)
      })

      it('should include a still pending invitation', async () => {
        const { ids } = await listAndTotal({ coauthor: true, user: COAUTHOR })
        expect(ids).toContain(pendingInvite)
      })

      it('should include an accepted invitation', async () => {
        const { ids } = await listAndTotal({ coauthor: true, user: COAUTHOR })
        expect(ids).toContain(approvedInvite)
      })

      it('should count both', async () => {
        const { total } = await listAndTotal({ coauthor: true, user: COAUTHOR })
        expect(total).toBe(2)
      })
    })

    // Once voting has closed a pending invitation is no longer actionable, so it drops out while
    // decided ones stay visible.
    describe('and the proposal has finished voting', () => {
      let pendingInvite: string
      let approvedInvite: string
      let rejectedInvite: string

      beforeEach(async () => {
        pendingInvite = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_PAST })).id
        approvedInvite = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_PAST })).id
        rejectedInvite = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_PAST })).id
        await insertCoauthor(pendingInvite, COAUTHOR, CoauthorStatus.PENDING)
        await insertCoauthor(approvedInvite, COAUTHOR, CoauthorStatus.APPROVED)
        await insertCoauthor(rejectedInvite, COAUTHOR, CoauthorStatus.REJECTED)
      })

      it('should drop the invitation that was never answered', async () => {
        const { ids } = await listAndTotal({ coauthor: true, user: COAUTHOR })
        expect(ids).not.toContain(pendingInvite)
      })

      it('should keep the accepted invitation', async () => {
        const { ids } = await listAndTotal({ coauthor: true, user: COAUTHOR })
        expect(ids).toContain(approvedInvite)
      })

      it('should keep the declined invitation', async () => {
        const { ids } = await listAndTotal({ coauthor: true, user: COAUTHOR })
        expect(ids).toContain(rejectedInvite)
      })

      it('should count only the answered invitations', async () => {
        const { total } = await listAndTotal({ coauthor: true, user: COAUTHOR })
        expect(total).toBe(2)
      })
    })

    describe('and the stored coauthor address differs in case', () => {
      let invited: string

      beforeEach(async () => {
        invited = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_FUTURE })).id
        await insertCoauthor(invited, COAUTHOR, CoauthorStatus.APPROVED)
      })

      it('should still match, since the comparison is case-insensitive', async () => {
        const { ids } = await listAndTotal({ coauthor: true, user: COAUTHOR.toUpperCase().replace('0X', '0x') })
        expect(ids).toEqual([invited])
      })
    })

    describe('and the caller only authored the proposal', () => {
      beforeEach(async () => {
        await insertProposalWith({ user: COAUTHOR, finish_at: IN_THE_FUTURE })
      })

      it('should return nothing, since authorship is not coauthorship', async () => {
        expect(await listAndTotal({ coauthor: true, user: COAUTHOR })).toEqual({ ids: [], total: 0 })
      })
    })

    describe('and another address was invited instead', () => {
      let invited: string

      beforeEach(async () => {
        invited = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_FUTURE })).id
        await insertCoauthor(invited, STRANGER, CoauthorStatus.APPROVED)
      })

      it('should not leak that proposal to a different address', async () => {
        expect(await listAndTotal({ coauthor: true, user: COAUTHOR })).toEqual({ ids: [], total: 0 })
      })
    })
  })

  describe('when filtering by coauthor without an address', () => {
    let withApproved: string
    let withPendingOnly: string
    let withNoCoauthors: string

    beforeEach(async () => {
      withApproved = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_FUTURE })).id
      withPendingOnly = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_FUTURE })).id
      withNoCoauthors = (await insertProposalWith({ user: AUTHOR, finish_at: IN_THE_FUTURE })).id
      await insertCoauthor(withApproved, COAUTHOR, CoauthorStatus.APPROVED)
      await insertCoauthor(withPendingOnly, COAUTHOR, CoauthorStatus.PENDING)
    })

    // The join is a left outer one here, so it decorates rather than filters.
    it('should still return every proposal', async () => {
      const { ids } = await listAndTotal({ coauthor: true })
      expect(ids.sort()).toEqual([withApproved, withPendingOnly, withNoCoauthors].sort())
    })

    it('should expose the accepted coauthors alongside the proposal', async () => {
      const list = await ProposalModel.getProposalList({ coauthor: true })
      const found = list.find((proposal) => proposal.id === withApproved)
      expect(found?.coauthors).toEqual([COAUTHOR])
    })

    it('should not expose coauthors whose invitation is still pending', async () => {
      const list = await ProposalModel.getProposalList({ coauthor: true })
      const found = list.find((proposal) => proposal.id === withPendingOnly)
      expect(found?.coauthors).toBeNull()
    })

    it('should leave proposals without coauthors undecorated', async () => {
      const list = await ProposalModel.getProposalList({ coauthor: true })
      const found = list.find((proposal) => proposal.id === withNoCoauthors)
      expect(found?.coauthors).toBeNull()
    })
  })

  describe('when filtering by subscription', () => {
    let subscribed: string
    let subscribedByStranger: string

    beforeEach(async () => {
      subscribed = (await insertProposalWith({ user: AUTHOR })).id
      subscribedByStranger = (await insertProposalWith({ user: AUTHOR })).id
      await insertProposalWith({ user: AUTHOR })
      await insertSubscription(subscribed, COAUTHOR)
      await insertSubscription(subscribedByStranger, STRANGER)
    })

    it('should return only the proposals that address subscribed to', async () => {
      const { ids } = await listAndTotal({ subscribed: COAUTHOR })
      expect(ids).toEqual([subscribed])
    })

    it('should count only those proposals', async () => {
      const { total } = await listAndTotal({ subscribed: COAUTHOR })
      expect(total).toBe(1)
    })

    it('should not leak another address’s subscriptions', async () => {
      const { ids } = await listAndTotal({ subscribed: COAUTHOR })
      expect(ids).not.toContain(subscribedByStranger)
    })

    it('should return nothing when the subscriber is not an address', async () => {
      expect(await listAndTotal({ subscribed: 'not-an-address' })).toEqual({ ids: [], total: 0 })
    })
  })

  describe('when a subscription filter is combined with a type filter', () => {
    let subscribedPoll: string

    beforeEach(async () => {
      subscribedPoll = (await insertProposalWith({ type: ProposalType.Poll, user: AUTHOR })).id
      const subscribedGrant = await insertProposalWith({ type: ProposalType.Grant, user: AUTHOR })
      await insertSubscription(subscribedPoll, COAUTHOR)
      await insertSubscription(subscribedGrant.id, COAUTHOR)
    })

    it('should apply both filters', async () => {
      const { ids } = await listAndTotal({ subscribed: COAUTHOR, type: ProposalType.Poll })
      expect(ids).toEqual([subscribedPoll])
    })
  })

  describe('when a subscribed proposal has been deleted', () => {
    beforeEach(async () => {
      const deleted = await insertProposalWith({ user: AUTHOR, deleted: true, status: ProposalStatus.Deleted })
      await insertSubscription(deleted.id, COAUTHOR)
    })

    it('should not surface it through the subscription filter', async () => {
      expect(await listAndTotal({ subscribed: COAUTHOR })).toEqual({ ids: [], total: 0 })
    })
  })
})
