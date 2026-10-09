import type { TransactionReceipt } from '@ethersproject/providers'

import EventModel from '../models/Event'
import { AlchemyBlock, AlchemyTransaction } from '../shared/types/events'

import { RECEIPT_GRACE_PERIOD_MS } from './DelegationReceiptVerifier'
import { ErrorService } from './ErrorService'
import RpcService from './RpcService'
import {
  DELEGATE,
  DELEGATOR,
  OTHER_TX_HASH,
  SET_DELEGATE_SIGNATURE_HASH,
  SNAPSHOT_DELEGATION_REGISTRY,
  SPACE_TOPIC,
  TX_HASH,
  UNRELATED_CONTRACT,
  addressTopic,
  block,
  log,
  receipt,
  transaction,
} from './delegationTestHelpers'
import { EventsService } from './events'

const OTHER_DELEGATE = '0x3333333333333333333333333333333333333333'
const nowInSeconds = () => Math.floor(Date.now() / 1000)
const recentBlock = (transactions: AlchemyTransaction[]) => block(transactions, nowInSeconds())
const staleBlock = (transactions: AlchemyTransaction[]) =>
  block(transactions, nowInSeconds() - RECEIPT_GRACE_PERIOD_MS / 1000 - 60)

async function outcomeOf(alchemyBlock: AlchemyBlock) {
  return EventsService.delegationUpdate(alchemyBlock)
    .then(() => 'resolved')
    .catch((error: Error) => error)
}

describe('EventsService.delegationUpdate on-chain verification', () => {
  let delegationSet: jest.SpyInstance
  let isDelegationTxRegistered: jest.SpyInstance
  let report: jest.SpyInstance
  let getEnvironmentProvider: jest.SpyInstance
  let getTransactionReceipt: jest.Mock

  function receiptsByHash(receipts: Record<string, TransactionReceipt | null | Error>) {
    getTransactionReceipt.mockImplementation(async (hash: string) => {
      const value = receipts[hash]
      if (value instanceof Error) throw value
      return value ?? null
    })
  }

  beforeEach(() => {
    getTransactionReceipt = jest.fn()
    getEnvironmentProvider = jest
      .spyOn(RpcService, 'getEnvironmentProvider')
      .mockReturnValue({ getTransactionReceipt } as never)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
    isDelegationTxRegistered = jest.spyOn(EventModel, 'isDelegationTxRegistered').mockResolvedValue(false)
    delegationSet = jest.spyOn(EventsService, 'delegationSet').mockResolvedValue(undefined)
    jest.spyOn(EventsService, 'delegationClear').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the receipt shows the registry emitted the exact log', () => {
    let outcome: unknown

    beforeEach(async () => {
      const genuine = log({ index: 12, account: undefined })
      receiptsByHash({ [TX_HASH]: receipt([genuine]) })
      outcome = await outcomeOf(staleBlock([transaction([genuine])]))
    })

    it('should record the delegation', () => {
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should complete the delivery', () => {
      expect(outcome).toBe('resolved')
    })

    it('should not report anything', () => {
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('when the receipt names the registry address in a different case', () => {
    beforeEach(async () => {
      const genuine = log({ account: undefined })
      receiptsByHash({ [TX_HASH]: receipt([genuine], { address: SNAPSHOT_DELEGATION_REGISTRY.toLowerCase() }) })
      await outcomeOf(staleBlock([transaction([genuine])]))
    })

    it('should still record the delegation, since address equality is case-insensitive', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  // The attack this exists for: the live Alchemy query omits the emitter, and any contract can emit
  // a log carrying the registry's topics.
  describe('when the receipt shows another contract emitted a log with the same topics', () => {
    let outcome: unknown

    beforeEach(async () => {
      const forged = log({ account: undefined })
      receiptsByHash({ [TX_HASH]: receipt([forged], { address: UNRELATED_CONTRACT }) })
      outcome = await outcomeOf(staleBlock([transaction([forged])]))
    })

    it('should drop the forged log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })

    it('should not ask alchemy to retry, since the answer will not change', () => {
      expect(outcome).toBe('resolved')
    })

    it('should report the dropped log with its full transaction hash', () => {
      expect(report).toHaveBeenCalledWith(
        'Dropped delegation logs that failed on-chain verification',
        expect.objectContaining({
          logs: [{ transaction_hash: TX_HASH, log_index: 0, reason: 'log was not emitted by the delegate registry' }],
        })
      )
    })
  })

  describe('when the receipt has no log at the index the payload claims', () => {
    beforeEach(async () => {
      const payloadLog = log({ index: 3, account: undefined })
      receiptsByHash({ [TX_HASH]: receipt([payloadLog], { logIndex: 4 }) })
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the registry log at that index has different topics', () => {
    beforeEach(async () => {
      const payloadLog = log({ account: undefined })
      const onChainTopics = [
        SET_DELEGATE_SIGNATURE_HASH,
        addressTopic(DELEGATOR),
        SPACE_TOPIC,
        addressTopic(OTHER_DELEGATE),
      ]
      receiptsByHash({ [TX_HASH]: receipt([payloadLog], { topics: onChainTopics }) })
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log rather than record a delegate the chain never saw', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the registry log at that index has different data', () => {
    beforeEach(async () => {
      const payloadLog = log({ account: undefined })
      receiptsByHash({ [TX_HASH]: receipt([payloadLog], { data: '0x01' }) })
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the transaction reverted', () => {
    beforeEach(async () => {
      const payloadLog = log({ account: undefined })
      receiptsByHash({ [TX_HASH]: receipt([payloadLog], { status: 0 }) })
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the payload names an emitter other than the registry', () => {
    beforeEach(async () => {
      await outcomeOf(staleBlock([transaction([log({ account: { address: UNRELATED_CONTRACT } })])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })

    it('should not reach for the RPC at all', () => {
      expect(getEnvironmentProvider).not.toHaveBeenCalled()
      expect(getTransactionReceipt).not.toHaveBeenCalled()
    })
  })

  describe('when the transaction has no hash', () => {
    let outcome: unknown

    beforeEach(async () => {
      const tx = { ...transaction([log()]), hash: undefined } as unknown as AlchemyTransaction
      outcome = await outcomeOf(recentBlock([tx]))
    })

    it('should drop its logs, since they cannot be verified', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })

    it('should complete the delivery instead of asking for a retry that cannot help', () => {
      expect(outcome).toBe('resolved')
    })

    it('should not query the database or the RPC with it', () => {
      expect(isDelegationTxRegistered).not.toHaveBeenCalled()
      expect(getTransactionReceipt).not.toHaveBeenCalled()
    })
  })

  // ethers throws on a malformed hash before any request is sent; letting that escape would turn a
  // payload quirk into an endless retry.
  describe('when the transaction hash is malformed', () => {
    let outcome: unknown

    beforeEach(async () => {
      outcome = await outcomeOf(recentBlock([transaction([log()], '0xnot-a-hash')]))
    })

    it('should drop its logs and complete the delivery', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(outcome).toBe('resolved')
    })

    it('should not query the RPC with it', () => {
      expect(getTransactionReceipt).not.toHaveBeenCalled()
    })
  })

  describe('when the RPC does not know the transaction', () => {
    describe('and the block is recent', () => {
      let outcome: unknown

      beforeEach(async () => {
        receiptsByHash({})
        outcome = await outcomeOf(recentBlock([transaction([log()])]))
      })

      // Our node can trail Alchemy's head by a block or two; a retry will find the receipt.
      it('should throw so alchemy retries the delivery', () => {
        expect(outcome).toBeInstanceOf(Error)
        expect((outcome as Error).message).toContain(TX_HASH)
      })

      it('should not record the delegation yet', () => {
        expect(delegationSet).not.toHaveBeenCalled()
      })
    })

    describe('and the block is older than the grace period', () => {
      let outcome: unknown

      beforeEach(async () => {
        receiptsByHash({})
        outcome = await outcomeOf(staleBlock([transaction([log()])]))
      })

      // Reorged out, or a webhook watching another chain: retrying forever would wedge the delivery.
      it('should drop the log and complete the delivery', () => {
        expect(delegationSet).not.toHaveBeenCalled()
        expect(outcome).toBe('resolved')
      })

      it('should report it as unknown to the RPC', () => {
        expect(report).toHaveBeenCalledWith(
          'Dropped delegation logs that failed on-chain verification',
          expect.objectContaining({
            logs: [{ transaction_hash: TX_HASH, log_index: 0, reason: 'transaction unknown to the RPC' }],
          })
        )
      })
    })
  })

  describe('when the RPC call fails', () => {
    let outcome: unknown

    beforeEach(async () => {
      receiptsByHash({ [TX_HASH]: new Error('429 Too Many Requests') })
      outcome = await outcomeOf(staleBlock([transaction([log()])]))
    })

    // Unlike an unknown transaction this is not bounded by the grace period: an outage says nothing
    // about the log, and only a validated hash is ever sent, so the payload cannot cause it.
    it('should throw so alchemy retries the delivery, even for an old block', () => {
      expect(outcome).toBeInstanceOf(Error)
    })

    it('should not record the delegation', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when a transaction carries several delegation logs', () => {
    beforeEach(async () => {
      const first = log({ index: 1, account: undefined })
      const second = log({
        index: 2,
        account: undefined,
        topics: [SET_DELEGATE_SIGNATURE_HASH, addressTopic(OTHER_DELEGATE), SPACE_TOPIC, addressTopic(DELEGATE)],
      })
      receiptsByHash({ [TX_HASH]: receipt([first, second]) })
      await outcomeOf(staleBlock([transaction([first, second])]))
    })

    it('should fetch the receipt only once', () => {
      expect(getTransactionReceipt).toHaveBeenCalledTimes(1)
    })

    it('should record both delegations', () => {
      expect(delegationSet).toHaveBeenCalledTimes(2)
    })
  })

  describe('when a genuine and a forged transaction arrive in the same block', () => {
    beforeEach(async () => {
      const genuine = log({ index: 1, account: undefined })
      const forged = log({ index: 5, account: undefined })
      receiptsByHash({
        [TX_HASH]: receipt([genuine]),
        [OTHER_TX_HASH]: receipt([forged], { address: UNRELATED_CONTRACT }),
      })
      await outcomeOf(staleBlock([transaction([genuine], TX_HASH), transaction([forged], OTHER_TX_HASH)]))
    })

    it('should record only the genuine one', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })
  })

  describe('when one transaction verifies and the RPC fails for another', () => {
    let outcome: unknown

    beforeEach(async () => {
      const genuine = log({ index: 1, account: undefined })
      receiptsByHash({ [TX_HASH]: receipt([genuine]), [OTHER_TX_HASH]: new Error('502 Bad Gateway') })
      outcome = await outcomeOf(
        recentBlock([transaction([genuine], TX_HASH), transaction([log({ index: 4 })], OTHER_TX_HASH)])
      )
    })

    it('should record the verified transaction without waiting for the other', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should throw naming only the transaction that still needs checking', () => {
      expect(outcome).toBeInstanceOf(Error)
      expect((outcome as Error).message).toContain(OTHER_TX_HASH)
      expect((outcome as Error).message).not.toContain(TX_HASH)
    })

    // The retry Alchemy sends must not record the first transaction twice.
    describe('and alchemy retries once the RPC recovers', () => {
      beforeEach(async () => {
        delegationSet.mockClear()
        getTransactionReceipt.mockClear()
        isDelegationTxRegistered.mockImplementation(async (hash: string) => hash === TX_HASH)
        const retried = log({ index: 4, account: undefined })
        receiptsByHash({ [TX_HASH]: receipt([log({ index: 1 })]), [OTHER_TX_HASH]: receipt([retried]) })
        outcome = await outcomeOf(
          recentBlock([transaction([log({ index: 1 })], TX_HASH), transaction([retried], OTHER_TX_HASH)])
        )
      })

      it('should record only the transaction that was pending', () => {
        expect(delegationSet).toHaveBeenCalledTimes(1)
        expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, OTHER_TX_HASH, expect.any(Date))
      })

      it('should only fetch the receipt it still needed', () => {
        expect(getTransactionReceipt).toHaveBeenCalledTimes(1)
        expect(getTransactionReceipt).toHaveBeenCalledWith(OTHER_TX_HASH)
      })

      it('should complete the delivery', () => {
        expect(outcome).toBe('resolved')
      })
    })
  })
})
