import BidModel from '../../src/entities/Bid/model'
import { UnpublishedBidStatus } from '../../src/entities/Bid/types'
import { ProposalStatus, ProposalType } from '../../src/entities/Proposal/types'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { insertProposalWith } from '../setup/factories'

const AUTHOR = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const OTHER_AUTHOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const TENDER = '00000000-0000-0000-0000-000000000001'
const OTHER_TENDER = '00000000-0000-0000-0000-000000000002'

const IN_THE_PAST = new Date(Date.now() - 60 * 60 * 1000).toISOString()
const IN_THE_FUTURE = new Date(Date.now() + 60 * 60 * 1000).toISOString()

const BID_DATA = { title: 'A bid', summary: 'What it proposes' }

async function createBid(overrides: { tender?: string; author?: string; publishAt?: string } = {}) {
  await BidModel.createBid({
    linked_proposal_id: overrides.tender ?? TENDER,
    author_address: overrides.author ?? AUTHOR,
    bid_proposal_data: JSON.stringify(BID_DATA) as never,
    publish_at: overrides.publishAt ?? IN_THE_PAST,
    status: UnpublishedBidStatus.Pending,
  })
}

/**
 * These feed publishBids, which is one of the two jobs serialized by the advisory lock because it
 * is not idempotent. The bid payload is encrypted in the column, so the encrypt and decrypt halves
 * only prove they agree when they run against a real database.
 */
describe('the bid queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  // A bid references the tender it is placed on, so the tenders have to exist first.
  beforeEach(async () => {
    await insertProposalWith({ id: TENDER, type: ProposalType.Tender, status: ProposalStatus.Passed })
    await insertProposalWith({ id: OTHER_TENDER, type: ProposalType.Tender, status: ProposalStatus.Passed })
  })

  describe('getBidsReadyToPublish', () => {
    describe('when a pending bid is due', () => {
      beforeEach(async () => {
        await createBid()
      })

      it('should return it', async () => {
        expect(await BidModel.getBidsReadyToPublish()).toHaveLength(1)
      })

      // The round trip is the point: stored encrypted, read back as the object that went in.
      it('should decrypt the payload back to what was stored', async () => {
        const [bid] = await BidModel.getBidsReadyToPublish()
        expect(bid.bid_proposal_data).toEqual(BID_DATA)
      })

      it('should lowercase the author it stores', async () => {
        const [bid] = await BidModel.getBidsReadyToPublish()
        expect(bid.author_address).toBe(AUTHOR.toLowerCase())
      })
    })

    describe('when a pending bid is not due yet', () => {
      beforeEach(async () => {
        await createBid({ publishAt: IN_THE_FUTURE })
      })

      it('should leave it alone until its publish time', async () => {
        expect(await BidModel.getBidsReadyToPublish()).toEqual([])
      })
    })

    describe('when a due bid has already been rejected', () => {
      beforeEach(async () => {
        await createBid()
        await BidModel.rejectBidsFromTenders([TENDER])
      })

      it('should not offer it for publishing', async () => {
        expect(await BidModel.getBidsReadyToPublish()).toEqual([])
      })
    })
  })

  describe('rejectBidsFromTenders', () => {
    describe('when bids exist on two tenders', () => {
      beforeEach(async () => {
        await createBid({ tender: TENDER })
        await createBid({ tender: OTHER_TENDER })
        await BidModel.rejectBidsFromTenders([TENDER])
      })

      it('should leave the bid on the other tender publishable', async () => {
        const ready = await BidModel.getBidsReadyToPublish()
        expect(ready.map((bid) => bid.linked_proposal_id)).toEqual([OTHER_TENDER])
      })
    })

    // Rejection rewrites the payload column, so it has to re-encrypt rather than leave plaintext or
    // corrupt what a later read decrypts.
    describe('when a rejected bid is read again', () => {
      beforeEach(async () => {
        await createBid({ tender: TENDER })
        await createBid({ tender: OTHER_TENDER })
        await BidModel.rejectBidsFromTenders([TENDER])
      })

      it('should still decrypt the untouched bid correctly', async () => {
        const [bid] = await BidModel.getBidsReadyToPublish()
        expect(bid.bid_proposal_data).toEqual(BID_DATA)
      })
    })

    describe('when no tenders are given', () => {
      beforeEach(async () => {
        await createBid()
      })

      it('should reject nothing', async () => {
        await BidModel.rejectBidsFromTenders([])
        expect(await BidModel.getBidsReadyToPublish()).toHaveLength(1)
      })
    })
  })

  describe('removePendingBid', () => {
    describe('when the author withdraws their own bid', () => {
      beforeEach(async () => {
        await createBid({ author: AUTHOR })
        await BidModel.removePendingBid(AUTHOR, TENDER)
      })

      it('should remove it', async () => {
        expect(await BidModel.getBidsReadyToPublish()).toEqual([])
      })
    })

    // Scoped to the author, so withdrawing cannot remove a competitor's bid from the same tender.
    describe('when another author withdraws from the same tender', () => {
      beforeEach(async () => {
        await createBid({ author: AUTHOR })
        await BidModel.removePendingBid(OTHER_AUTHOR, TENDER)
      })

      it('should leave the first author’s bid in place', async () => {
        expect(await BidModel.getBidsReadyToPublish()).toHaveLength(1)
      })
    })

    describe('when the author’s address differs in case from the stored one', () => {
      beforeEach(async () => {
        await createBid({ author: AUTHOR.toLowerCase() })
        await BidModel.removePendingBid(AUTHOR, TENDER)
      })

      it('should still remove it, since both sides are lowercased', async () => {
        expect(await BidModel.getBidsReadyToPublish()).toEqual([])
      })
    })
  })

  describe('getOpenTendersTotal', () => {
    describe('when several bids sit on the same tender', () => {
      beforeEach(async () => {
        await createBid({ tender: TENDER, author: AUTHOR })
        await createBid({ tender: TENDER, author: OTHER_AUTHOR })
        await createBid({ tender: OTHER_TENDER, author: AUTHOR })
      })

      it('should count tenders rather than bids', async () => {
        expect(Number((await BidModel.getOpenTendersTotal()).total)).toBe(2)
      })
    })
  })
})
