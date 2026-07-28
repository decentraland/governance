import EventModel from '../../src/models/Event'
import { EventsService } from '../../src/services/events'
import { EventType } from '../../src/shared/types/events'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'

const DELEGATE = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
const DELEGATOR = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const TX_HASH = '0x00000000000000000000000000000000000000000000000000000000000000aa'
const OTHER_TX_HASH = '0x00000000000000000000000000000000000000000000000000000000000000bb'

jest.mock('../../src/services/notification', () => ({ NotificationService: {} }))

/**
 * This is what stops the delegation webhook recording the same block twice, and it matters because
 * the webhook deliberately returns a non-2xx on failure so Alchemy retries. The guard reads a JSONB
 * path out of the stored event, so the only way to know it matches what the writer puts there is to
 * write a real row and ask.
 */
describe('EventModel.isDelegationTxRegistered', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('when no delegation has been recorded', () => {
    it('should report the transaction as unseen', async () => {
      expect(await EventModel.isDelegationTxRegistered(TX_HASH)).toBe(false)
    })
  })

  describe('when a delegation set was recorded by the service that writes it', () => {
    beforeEach(async () => {
      await EventsService.delegationSet(DELEGATE, DELEGATOR, TX_HASH, new Date())
    })

    it('should recognise that transaction', async () => {
      expect(await EventModel.isDelegationTxRegistered(TX_HASH)).toBe(true)
    })

    it('should not confuse it with a different transaction', async () => {
      expect(await EventModel.isDelegationTxRegistered(OTHER_TX_HASH)).toBe(false)
    })
  })

  describe('when a delegation clear was recorded', () => {
    beforeEach(async () => {
      await EventsService.delegationClear(DELEGATE, DELEGATOR, TX_HASH, new Date())
    })

    it('should recognise that transaction too', async () => {
      expect(await EventModel.isDelegationTxRegistered(TX_HASH)).toBe(true)
    })
  })

  // The guard filters on the delegation event types, so an unrelated event carrying the same hash
  // must not make a genuine delegation look already handled.
  describe('when an unrelated event carries the same transaction hash', () => {
    beforeEach(async () => {
      await EventModel.create({
        id: '00000000-0000-0000-0000-0000000000ff',
        address: DELEGATOR,
        event_type: EventType.ProposalCreated,
        event_data: { transaction_hash: TX_HASH, proposal_id: 'a-proposal', proposal_title: 'A proposal' },
        created_at: new Date(),
      } as never)
    })

    it('should still report the delegation as unseen', async () => {
      expect(await EventModel.isDelegationTxRegistered(TX_HASH)).toBe(false)
    })
  })

  describe('when the same transaction is recorded twice', () => {
    beforeEach(async () => {
      await EventsService.delegationSet(DELEGATE, DELEGATOR, TX_HASH, new Date())
      await EventsService.delegationSet(DELEGATE, DELEGATOR, TX_HASH, new Date())
    })

    it('should still report it as seen rather than miscounting', async () => {
      expect(await EventModel.isDelegationTxRegistered(TX_HASH)).toBe(true)
    })
  })
})
