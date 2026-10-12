import type { Log } from '@ethersproject/providers'

import EventModel from '../models/Event'
import { AlchemyBlock, AlchemyLog, AlchemyTransaction } from '../shared/types/events'

import { VERIFICATION_GRACE_PERIOD_MS } from './DelegationLogVerifier'
import { ErrorService } from './ErrorService'
import RpcService from './RpcService'
import {
  BLOCK_HASH,
  BLOCK_NUMBER,
  CLEAR_DELEGATE_SIGNATURE_HASH,
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
  chainLog,
  log,
  nodeGetLogs,
  transaction,
} from './delegationTestHelpers'
import { EventsService } from './events'

const OTHER_DELEGATE = '0x3333333333333333333333333333333333333333'
const VICTIM = '0x4444444444444444444444444444444444444444'
const UNKNOWN_BLOCK_HASH = '0x' + 'dd'.repeat(32)
const DROPPED = 'Dropped delegation logs that failed on-chain verification'

const nowInSeconds = () => Math.floor(Date.now() / 1000)
const recentBlock = (transactions: AlchemyTransaction[], hash = BLOCK_HASH) => block(transactions, nowInSeconds(), hash)
const staleBlock = (transactions: AlchemyTransaction[], hash = BLOCK_HASH) =>
  block(transactions, nowInSeconds() - VERIFICATION_GRACE_PERIOD_MS / 1000 - 60, hash)

// Shaped like the error ethers v5 throws when the node answers with a JSON-RPC error.
function rpcError(code: number, message: string) {
  return Object.assign(new Error('processing response error (url="https://rpc.example/mainnet")'), {
    code: 'SERVER_ERROR',
    error: { code, message },
  })
}

async function outcomeOf(alchemyBlock: AlchemyBlock) {
  return EventsService.delegationUpdate(alchemyBlock)
    .then(() => 'resolved')
    .catch((error: Error) => error)
}

describe('EventsService.delegationUpdate on-chain verification', () => {
  let delegationSet: jest.SpyInstance
  let delegationClear: jest.SpyInstance
  let isDelegationTxRegistered: jest.SpyInstance
  let report: jest.SpyInstance
  let getEnvironmentProvider: jest.SpyInstance
  let getLogs: jest.Mock
  let getBlock: jest.Mock

  function chainHolds(...chainLogs: Log[]) {
    getLogs.mockImplementation(nodeGetLogs(chainLogs))
  }

  function droppedLogs() {
    const call = report.mock.calls.find(([message]) => message === DROPPED)
    return call?.[1].logs
  }

  beforeEach(() => {
    getLogs = jest.fn()
    getBlock = jest.fn()
    getEnvironmentProvider = jest
      .spyOn(RpcService, 'getEnvironmentProvider')
      .mockReturnValue({ getLogs, getBlock } as never)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
    isDelegationTxRegistered = jest.spyOn(EventModel, 'isDelegationTxRegistered').mockResolvedValue(false)
    delegationSet = jest.spyOn(EventsService, 'delegationSet').mockResolvedValue(undefined)
    delegationClear = jest.spyOn(EventsService, 'delegationClear').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the chain shows the registry emitted the exact log', () => {
    let outcome: unknown

    beforeEach(async () => {
      const genuine = log({ index: 12, account: undefined })
      chainHolds(chainLog(genuine))
      outcome = await outcomeOf(staleBlock([transaction([genuine])]))
    })

    it('should record the delegation', () => {
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should ask the node only for registry delegation logs of the delivered block', () => {
      expect(getLogs).toHaveBeenCalledTimes(1)
      expect(getLogs).toHaveBeenCalledWith({
        blockHash: BLOCK_HASH,
        address: SNAPSHOT_DELEGATION_REGISTRY,
        topics: [[SET_DELEGATE_SIGNATURE_HASH, CLEAR_DELEGATE_SIGNATURE_HASH]],
      })
      expect(getBlock).not.toHaveBeenCalled()
    })

    it('should complete the delivery without reporting anything', () => {
      expect(outcome).toBe('resolved')
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('when the chain holds a ClearDelegate log', () => {
    beforeEach(async () => {
      const clear = log({
        account: undefined,
        topics: [CLEAR_DELEGATE_SIGNATURE_HASH, addressTopic(DELEGATOR), SPACE_TOPIC, addressTopic(DELEGATE)],
      })
      chainHolds(chainLog(clear))
      await outcomeOf(staleBlock([transaction([clear])]))
    })

    it('should record the clear', () => {
      expect(delegationClear).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })
  })

  describe('when the node names the registry address in a different case', () => {
    beforeEach(async () => {
      const genuine = log({ account: undefined })
      chainHolds(chainLog(genuine, TX_HASH, { address: SNAPSHOT_DELEGATION_REGISTRY.toLowerCase() }))
      await outcomeOf(staleBlock([transaction([genuine])]))
    })

    it('should still record the delegation, since address equality is case-insensitive', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  // The attack this exists for: the live Alchemy query omits the emitter, and any contract can emit
  // a log carrying the registry's topics.
  describe('when another contract emitted a log with the registry topics', () => {
    let outcome: unknown

    beforeEach(async () => {
      const forged = log({ account: undefined })
      chainHolds(chainLog(forged, TX_HASH, { address: UNRELATED_CONTRACT }))
      outcome = await outcomeOf(staleBlock([transaction([forged])]))
    })

    it('should drop the forged log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })

    it('should not ask alchemy to retry, since the answer will not change', () => {
      expect(outcome).toBe('resolved')
    })

    it('should report the dropped log in full', () => {
      expect(droppedLogs()).toEqual([
        {
          transaction_hash: TX_HASH,
          log_index: 0,
          method: 'SetDelegate',
          delegator: DELEGATOR,
          delegate: DELEGATE,
          reason: 'no delegate registry log at that transaction and index',
        },
      ])
    })
  })

  // The natural shape of the attack: a contract that calls the real registry and, in the same
  // transaction, emits its own look-alike log naming someone else.
  describe('when one transaction holds a genuine registry log and a forged one from another contract', () => {
    beforeEach(async () => {
      const genuine = log({ index: 10, account: undefined })
      const forged = log({
        index: 11,
        account: undefined,
        topics: [SET_DELEGATE_SIGNATURE_HASH, addressTopic(VICTIM), SPACE_TOPIC, addressTopic(DELEGATE)],
      })
      chainHolds(chainLog(genuine), chainLog(forged, TX_HASH, { address: UNRELATED_CONTRACT }))
      await outcomeOf(staleBlock([transaction([genuine, forged])]))
    })

    it('should record only the genuine delegation', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should report the forged log by its index', () => {
      expect(droppedLogs()).toEqual([expect.objectContaining({ log_index: 11, delegator: VICTIM })])
    })
  })

  // eth_getLogs is asked for the registry address only; if the RPC ignored that filter, the check
  // must still hold.
  describe('when the RPC returns a log from another contract despite the address filter', () => {
    beforeEach(async () => {
      const forged = log({ account: undefined })
      getLogs.mockResolvedValue([chainLog(forged, TX_HASH, { address: UNRELATED_CONTRACT })])
      await outcomeOf(staleBlock([transaction([forged])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(droppedLogs()).toEqual([
        expect.objectContaining({ reason: 'log was not emitted by the delegate registry' }),
      ])
    })
  })

  describe('when the registry log is at a different index than the payload claims', () => {
    beforeEach(async () => {
      const payloadLog = log({ index: 3, account: undefined })
      chainHolds(chainLog(payloadLog, TX_HASH, { logIndex: 4 }))
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the registry log at that index belongs to another transaction', () => {
    beforeEach(async () => {
      const payloadLog = log({ account: undefined })
      chainHolds(chainLog(payloadLog, OTHER_TX_HASH))
      await outcomeOf(staleBlock([transaction([payloadLog], TX_HASH)]))
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
      chainHolds(chainLog(payloadLog, TX_HASH, { topics: onChainTopics }))
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log rather than record a delegate the chain never saw', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(droppedLogs()).toEqual([expect.objectContaining({ reason: 'log topics differ from the chain' })])
    })
  })

  describe('when the payload carries more topics than the registry log', () => {
    beforeEach(async () => {
      const genuine = log({ account: undefined })
      const padded = log({ account: undefined, topics: [...genuine.topics, SPACE_TOPIC] })
      chainHolds(chainLog(genuine))
      await outcomeOf(staleBlock([transaction([padded])]))
    })

    it('should drop the log, since topics must match exactly', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(droppedLogs()).toEqual([expect.objectContaining({ reason: 'log topics differ from the chain' })])
    })
  })

  describe('when the registry log at that index has different data', () => {
    beforeEach(async () => {
      const payloadLog = log({ account: undefined })
      chainHolds(chainLog(payloadLog, TX_HASH, { data: '0x01' }))
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(droppedLogs()).toEqual([expect.objectContaining({ reason: 'log data differs from the chain' })])
    })
  })

  // SetDelegate/ClearDelegate carry no unindexed arguments, so their data is always 0x.
  describe('when the payload omits the log data', () => {
    beforeEach(async () => {
      const genuine = log({ account: undefined })
      const withoutData = { ...genuine, data: undefined } as unknown as AlchemyLog
      chainHolds(chainLog(genuine))
      await outcomeOf(staleBlock([transaction([withoutData])]))
    })

    it('should compare it as 0x and record the delegation', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the payload omits the log data and the chain log has some', () => {
    beforeEach(async () => {
      const genuine = log({ account: undefined })
      const withoutData = { ...genuine, data: undefined } as unknown as AlchemyLog
      chainHolds(chainLog(genuine, TX_HASH, { data: '0x01' }))
      await outcomeOf(staleBlock([transaction([withoutData])]))
    })

    it('should drop the log rather than skip the data check', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the node marks the registry log as removed', () => {
    beforeEach(async () => {
      const payloadLog = log({ account: undefined })
      chainHolds(chainLog(payloadLog, TX_HASH, { removed: true }))
      await outcomeOf(staleBlock([transaction([payloadLog])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  // A reverted transaction keeps no logs, so the node returns nothing for it.
  describe('when the transaction reverted', () => {
    beforeEach(async () => {
      chainHolds()
      await outcomeOf(staleBlock([transaction([log({ account: undefined })])]))
    })

    it('should drop the log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when a block carries many forged transactions', () => {
    beforeEach(async () => {
      const forgedTransactions = Array.from({ length: 50 }, (_, i) =>
        transaction([log({ index: i, account: undefined })], '0x' + i.toString(16).padStart(64, '0'))
      )
      chainHolds()
      await outcomeOf(staleBlock(forgedTransactions))
    })

    // The RPC cost of a delivery must not grow with what an attacker can pack into a block.
    it('should still read the chain only once', () => {
      expect(getLogs).toHaveBeenCalledTimes(1)
    })

    it('should drop them all', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(droppedLogs()).toHaveLength(50)
    })
  })

  describe('when the payload names an emitter other than the registry', () => {
    beforeEach(async () => {
      await outcomeOf(staleBlock([transaction([log({ account: { address: UNRELATED_CONTRACT } })])]))
    })

    it('should drop the log without reaching for the RPC', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(getEnvironmentProvider).not.toHaveBeenCalled()
    })
  })

  describe('when the transaction has no hash', () => {
    let outcome: unknown

    beforeEach(async () => {
      const tx = { ...transaction([log()]), hash: undefined } as unknown as AlchemyTransaction
      outcome = await outcomeOf(recentBlock([tx]))
    })

    it('should drop its logs and complete the delivery, since a retry cannot help', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(outcome).toBe('resolved')
    })

    it('should not query the database or the RPC with it', () => {
      expect(isDelegationTxRegistered).not.toHaveBeenCalled()
      expect(getLogs).not.toHaveBeenCalled()
    })
  })

  describe('when the transaction hash is malformed', () => {
    let outcome: unknown

    beforeEach(async () => {
      outcome = await outcomeOf(recentBlock([transaction([log()], '0xnot-a-hash')]))
    })

    it('should drop its logs and complete the delivery without querying the RPC', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(outcome).toBe('resolved')
      expect(getLogs).not.toHaveBeenCalled()
    })
  })

  // Transaction and block hashes share one 32-byte hex check, so both are tested at its boundaries.
  describe.each([
    ['63 hex digits', '0x' + 'a'.repeat(63)],
    ['65 hex digits', '0x' + 'a'.repeat(65)],
    ['64 hex digits and trailing junk', '0x' + 'a'.repeat(64) + 'z'],
    ['leading junk before 64 hex digits', 'z0x' + 'a'.repeat(64)],
    ['64 hex digits without the 0x prefix', 'a'.repeat(64)],
  ])('when a hash has %s', (_, malformedHash) => {
    describe('as the transaction hash', () => {
      let outcome: unknown

      beforeEach(async () => {
        outcome = await outcomeOf(recentBlock([transaction([log()], malformedHash)]))
      })

      it('should drop its logs without querying the database or the RPC', () => {
        expect(outcome).toBe('resolved')
        expect(delegationSet).not.toHaveBeenCalled()
        expect(isDelegationTxRegistered).not.toHaveBeenCalled()
        expect(getEnvironmentProvider).not.toHaveBeenCalled()
      })
    })

    describe('as the block hash', () => {
      let outcome: unknown

      beforeEach(async () => {
        const genuine = log({ account: undefined })
        const timestamp = nowInSeconds()
        getBlock.mockResolvedValue({ hash: BLOCK_HASH, number: BLOCK_NUMBER, timestamp, transactions: [TX_HASH] })
        chainHolds(chainLog(genuine))
        outcome = await outcomeOf(block([transaction([genuine])], timestamp, malformedHash))
      })

      it('should ignore it and look the block up by number', () => {
        expect(getBlock).toHaveBeenCalledWith(BLOCK_NUMBER)
        expect(getLogs).toHaveBeenCalledWith(expect.objectContaining({ blockHash: BLOCK_HASH }))
        expect(delegationSet).toHaveBeenCalledTimes(1)
        expect(outcome).toBe('resolved')
      })
    })
  })

  describe('when the payload sends the log index as a numeric string', () => {
    beforeEach(async () => {
      const genuine = log({ index: 10, account: undefined })
      chainHolds(chainLog(genuine))
      await outcomeOf(staleBlock([transaction([{ ...genuine, index: '10' } as unknown as AlchemyLog])]))
    })

    it('should still match it against the chain', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  describe.each([['x'], [''], [-1], [1.5], [null]])('when the payload log index is %p', (index) => {
    let outcome: unknown

    beforeEach(async () => {
      outcome = await outcomeOf(recentBlock([transaction([{ ...log(), index } as unknown as AlchemyLog])]))
    })

    it('should drop the log without querying the RPC', () => {
      expect(delegationSet).not.toHaveBeenCalled()
      expect(outcome).toBe('resolved')
      expect(getLogs).not.toHaveBeenCalled()
    })
  })

  describe('when the RPC cannot be read', () => {
    describe('and the block is within the grace period', () => {
      let outcome: unknown

      beforeEach(async () => {
        getLogs.mockRejectedValue(rpcError(-32001, `block not found: hash ${BLOCK_HASH}`))
        outcome = await outcomeOf(recentBlock([transaction([log({ index: 7 })])]))
      })

      it('should throw so alchemy retries the delivery', () => {
        expect(outcome).toBeInstanceOf(Error)
      })

      it('should name what is pending and why, enough to backfill by hand', () => {
        const message = (outcome as Error).message
        expect(message).toContain(`${TX_HASH}#7 ${DELEGATOR} -> ${DELEGATE}`)
        expect(message).toContain(`SERVER_ERROR: -32001 block not found: hash ${BLOCK_HASH}`)
      })

      it('should not leak the RPC url', () => {
        expect((outcome as Error).message).not.toContain('rpc.example')
      })

      it('should not record or drop anything', () => {
        expect(delegationSet).not.toHaveBeenCalled()
        expect(report).not.toHaveBeenCalled()
      })
    })

    describe('and the node does not know the delivered block yet', () => {
      let outcome: unknown

      beforeEach(async () => {
        chainHolds(chainLog(log()))
        outcome = await outcomeOf(recentBlock([transaction([log()])], UNKNOWN_BLOCK_HASH))
      })

      // An unknown block hash is an error, not an empty result, so node lag cannot pass for a forgery.
      it('should throw so alchemy retries the delivery', () => {
        expect((outcome as Error).message).toContain('Could not read delegation logs on chain yet')
        expect((outcome as Error).message).toContain(`block not found: hash ${UNKNOWN_BLOCK_HASH}`)
        expect(delegationSet).not.toHaveBeenCalled()
      })
    })

    describe('and the request timed out', () => {
      let outcome: unknown

      beforeEach(async () => {
        getLogs.mockRejectedValue(Object.assign(new Error('timeout'), { code: 'TIMEOUT' }))
        outcome = await outcomeOf(recentBlock([transaction([log()])]))
      })

      it('should throw naming the timeout', () => {
        expect((outcome as Error).message).toContain('(TIMEOUT)')
      })
    })

    describe('and the block is older than the grace period', () => {
      let outcome: unknown

      beforeEach(async () => {
        getLogs.mockRejectedValue(rpcError(-32000, 'unknown block'))
        outcome = await outcomeOf(staleBlock([transaction([log()])]))
      })

      // A late or replayed delivery must not be retried forever.
      it('should drop the log and complete the delivery', () => {
        expect(delegationSet).not.toHaveBeenCalled()
        expect(outcome).toBe('resolved')
      })

      it('should report it in full with the RPC failure', () => {
        expect(droppedLogs()).toEqual([
          {
            transaction_hash: TX_HASH,
            log_index: 0,
            method: 'SetDelegate',
            delegator: DELEGATOR,
            delegate: DELEGATE,
            reason: 'could not read the block from the RPC: SERVER_ERROR: -32000 unknown block',
          },
        ])
      })
    })
  })

  describe('when the RPC fails and alchemy retries once it recovers', () => {
    let outcome: unknown

    beforeEach(async () => {
      const genuine = log({ index: 1, account: undefined })
      const delivery = recentBlock([transaction([genuine], TX_HASH)])
      getLogs.mockRejectedValueOnce(rpcError(-32603, 'Internal error'))
      await outcomeOf(delivery)
      chainHolds(chainLog(genuine, TX_HASH))
      outcome = await outcomeOf(delivery)
    })

    it('should record the delegation exactly once', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should complete the retried delivery', () => {
      expect(outcome).toBe('resolved')
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
      chainHolds(chainLog(first), chainLog(second))
      await outcomeOf(staleBlock([transaction([first, second])]))
    })

    it('should record both delegations', () => {
      expect(delegationSet).toHaveBeenCalledTimes(2)
    })
  })

  // Every replay-guard check runs before any write, so a repeat inside one payload must be caught
  // by the service itself.
  describe('when the payload lists the same transaction twice', () => {
    let outcome: unknown

    beforeEach(async () => {
      const genuine = log({ index: 4, account: undefined })
      chainHolds(chainLog(genuine))
      outcome = await outcomeOf(
        staleBlock([transaction([genuine], TX_HASH), transaction([genuine], TX_HASH.toUpperCase().replace('0X', '0x'))])
      )
    })

    it('should record the delegation once', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should check the transaction against the database once', () => {
      expect(isDelegationTxRegistered).toHaveBeenCalledTimes(1)
    })

    it('should complete the delivery without reporting the repeat as dropped', () => {
      expect(outcome).toBe('resolved')
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('when a transaction lists the same log twice', () => {
    beforeEach(async () => {
      const genuine = log({ index: 4, account: undefined })
      chainHolds(chainLog(genuine))
      await outcomeOf(staleBlock([transaction([genuine, genuine])]))
    })

    it('should record the delegation once', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the payload lists the same transaction twice, each time with a different log', () => {
    beforeEach(async () => {
      const first = log({ index: 1, account: undefined })
      const second = log({
        index: 2,
        account: undefined,
        topics: [SET_DELEGATE_SIGNATURE_HASH, addressTopic(OTHER_DELEGATE), SPACE_TOPIC, addressTopic(DELEGATE)],
      })
      chainHolds(chainLog(first), chainLog(second))
      await outcomeOf(staleBlock([transaction([first]), transaction([second, first])]))
    })

    it('should record each distinct log once', () => {
      expect(delegationSet).toHaveBeenCalledTimes(2)
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, OTHER_DELEGATE, TX_HASH, expect.any(Date))
    })
  })

  describe('when a genuine and a forged transaction arrive in the same block', () => {
    beforeEach(async () => {
      const genuine = log({ index: 1, account: undefined })
      const forged = log({ index: 5, account: undefined })
      chainHolds(chainLog(genuine, TX_HASH), chainLog(forged, OTHER_TX_HASH, { address: UNRELATED_CONTRACT }))
      await outcomeOf(staleBlock([transaction([genuine], TX_HASH), transaction([forged], OTHER_TX_HASH)]))
    })

    it('should record only the genuine one', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })
  })

  describe('when the payload carries no block hash', () => {
    // A block our node may hold at the same height instead of the one Alchemy delivered: an orphaned
    // fork, or an upstream behind the load balancer that has not caught up.
    const NODE_FORK_HASH = '0x' + 'ee'.repeat(32)
    const UNRELATED_TX_HASH = '0x' + 'ff'.repeat(32)
    // The delivered block's timestamp, recent enough to be within the grace period.
    const DELIVERED_AT = nowInSeconds()
    // A block competing at the same height comes from another slot, 12 s later.
    const SIBLING_AT = DELIVERED_AT + 12
    const STALE_AT = DELIVERED_AT - VERIFICATION_GRACE_PERIOD_MS / 1000 - 60

    const withoutHash = (transactions: AlchemyTransaction[], timestamp = DELIVERED_AT) =>
      ({ ...block(transactions, timestamp), hash: undefined } as unknown as AlchemyBlock)

    // What the node holds at BLOCK_NUMBER: the block's hash, timestamp and transaction hashes, and its
    // registry logs.
    function nodeHoldsAtHeight(
      nodeBlock: { hash: string; transactions: string[]; timestamp?: number },
      ...chainLogs: Log[]
    ) {
      const { hash, transactions, timestamp = DELIVERED_AT } = nodeBlock
      getBlock.mockResolvedValue({ hash, number: BLOCK_NUMBER, timestamp, transactions })
      getLogs.mockImplementation(nodeGetLogs(chainLogs, hash))
    }

    describe('and the node has the delivered block at that height', () => {
      let outcome: unknown

      beforeEach(async () => {
        const genuine = log({ account: undefined })
        nodeHoldsAtHeight({ hash: BLOCK_HASH, transactions: [TX_HASH] }, chainLog(genuine))
        outcome = await outcomeOf(withoutHash([transaction([genuine])]))
      })

      it('should look the block up by number and verify against it', () => {
        expect(getBlock).toHaveBeenCalledWith(BLOCK_NUMBER)
        expect(getLogs).toHaveBeenCalledWith(expect.objectContaining({ blockHash: BLOCK_HASH }))
        expect(delegationSet).toHaveBeenCalledTimes(1)
        expect(outcome).toBe('resolved')
      })

      it('should read the chain with exactly two calls', () => {
        expect(getBlock).toHaveBeenCalledTimes(1)
        expect(getLogs).toHaveBeenCalledTimes(1)
      })
    })

    describe('and the node reports the transaction hash in a different case', () => {
      beforeEach(async () => {
        const forged = log({ account: undefined })
        nodeHoldsAtHeight({ hash: BLOCK_HASH, transactions: [TX_HASH.toUpperCase().replace('0X', '0x')] })
        await outcomeOf(withoutHash([transaction([forged])]))
      })

      it('should still treat the transaction as part of the checked block', () => {
        expect(droppedLogs()).toEqual([
          expect.objectContaining({ reason: 'no delegate registry log at that transaction and index' }),
        ])
      })
    })

    describe('and the payload sends the transaction hash in a different case than the node', () => {
      let outcome: unknown

      beforeEach(async () => {
        const forged = log({ account: undefined })
        nodeHoldsAtHeight({ hash: BLOCK_HASH, transactions: [OTHER_TX_HASH] })
        const upperCaseHash = OTHER_TX_HASH.toUpperCase().replace('0X', '0x')
        outcome = await outcomeOf(withoutHash([transaction([forged], upperCaseHash)]))
      })

      it('should still treat the transaction as part of the checked block and drop the log', () => {
        expect(outcome).toBe('resolved')
        expect(droppedLogs()).toEqual([
          expect.objectContaining({ reason: 'no delegate registry log at that transaction and index' }),
        ])
      })
    })

    // The node's block at that height is the delivered one (same timestamp) and holds the transaction,
    // and the registry did not emit the log: that is final.
    describe('and the transaction is in the node block but the registry log is not', () => {
      let outcome: unknown

      beforeEach(async () => {
        const forged = log({ account: undefined })
        nodeHoldsAtHeight(
          { hash: BLOCK_HASH, transactions: [TX_HASH] },
          chainLog(forged, TX_HASH, { address: UNRELATED_CONTRACT })
        )
        outcome = await outcomeOf(withoutHash([transaction([forged])]))
      })

      it('should drop the log without asking alchemy to retry', () => {
        expect(delegationSet).not.toHaveBeenCalled()
        expect(outcome).toBe('resolved')
        expect(droppedLogs()).toEqual([
          expect.objectContaining({ reason: 'no delegate registry log at that transaction and index' }),
        ])
      })
    })

    describe('and the block carries many forged transactions', () => {
      beforeEach(async () => {
        const txHashes = Array.from({ length: 50 }, (_, i) => '0x' + i.toString(16).padStart(64, '0'))
        const forgedTransactions = txHashes.map((hash, i) => transaction([log({ index: i, account: undefined })], hash))
        nodeHoldsAtHeight({ hash: BLOCK_HASH, transactions: txHashes })
        await outcomeOf(withoutHash(forgedTransactions))
      })

      // Telling a forgery from a node on another fork must not cost an RPC call per transaction.
      it('should still read the chain with exactly two calls', () => {
        expect(getBlock).toHaveBeenCalledTimes(1)
        expect(getLogs).toHaveBeenCalledTimes(1)
      })

      it('should drop them all', () => {
        expect(delegationSet).not.toHaveBeenCalled()
        expect(droppedLogs()).toHaveLength(50)
      })
    })

    // The case the fallback could get wrong for good: our node still holds a competing block at that
    // height. It was built from the same mempool, so it holds the delivered transaction too, but the
    // genuine registry log sits at another block-wide index in it.
    describe('and the node holds a competing block at that height that also holds the transaction', () => {
      const SIBLING_INDEX = 2
      const DELIVERED_INDEX = 7
      const genuine = log({ index: DELIVERED_INDEX, account: undefined })

      function nodeHoldsSibling() {
        nodeHoldsAtHeight(
          { hash: NODE_FORK_HASH, transactions: [UNRELATED_TX_HASH, TX_HASH], timestamp: SIBLING_AT },
          chainLog(genuine, TX_HASH, { blockHash: NODE_FORK_HASH, logIndex: SIBLING_INDEX })
        )
      }

      describe('within the grace period', () => {
        let outcome: unknown

        beforeEach(async () => {
          nodeHoldsSibling()
          outcome = await outcomeOf(withoutHash([transaction([genuine])]))
        })

        it('should throw so alchemy retries the delivery', () => {
          expect((outcome as Error).message).toContain('Could not read delegation logs on chain yet')
          expect((outcome as Error).message).toContain(
            `the node's block ${BLOCK_NUMBER} (${NODE_FORK_HASH}) has timestamp ${SIBLING_AT}, not the delivered ${DELIVERED_AT}`
          )
          expect((outcome as Error).message).toContain(`${TX_HASH}#${DELIVERED_INDEX} ${DELEGATOR} -> ${DELEGATE}`)
        })

        it('should not record or drop anything', () => {
          expect(delegationSet).not.toHaveBeenCalled()
          expect(report).not.toHaveBeenCalled()
        })

        it('should not read the logs of a block it already knows is the wrong one', () => {
          expect(getBlock).toHaveBeenCalledTimes(1)
          expect(getLogs).not.toHaveBeenCalled()
        })
      })

      describe('and alchemy retries once the node has switched to the delivered block', () => {
        let outcome: unknown

        beforeEach(async () => {
          const delivery = withoutHash([transaction([genuine])])
          nodeHoldsSibling()
          await outcomeOf(delivery)
          nodeHoldsAtHeight({ hash: BLOCK_HASH, transactions: [TX_HASH, UNRELATED_TX_HASH] }, chainLog(genuine))
          outcome = await outcomeOf(delivery)
        })

        it('should record the delegation exactly once', () => {
          expect(delegationSet).toHaveBeenCalledTimes(1)
          expect(outcome).toBe('resolved')
        })
      })

      describe('past the grace period', () => {
        let outcome: unknown

        beforeEach(async () => {
          nodeHoldsSibling()
          outcome = await outcomeOf(withoutHash([transaction([genuine])], STALE_AT))
        })

        it('should drop the log and report which block the node held', () => {
          expect(outcome).toBe('resolved')
          expect(delegationSet).not.toHaveBeenCalled()
          expect(droppedLogs()).toEqual([
            expect.objectContaining({
              transaction_hash: TX_HASH,
              log_index: DELIVERED_INDEX,
              reason: `the node's block ${BLOCK_NUMBER} (${NODE_FORK_HASH}) has timestamp ${SIBLING_AT}, not the delivered ${STALE_AT}`,
            }),
          ])
        })
      })
    })

    // A second line of defence, in case a competing block ever carried the delivered timestamp (two
    // blocks of one slot need the proposer to equivocate): a block without the delivered transaction
    // is not the delivered block either.
    describe('and the node holds a block with the delivered timestamp but without the delivered transaction', () => {
      describe('within the grace period', () => {
        let outcome: unknown

        beforeEach(async () => {
          nodeHoldsAtHeight({ hash: NODE_FORK_HASH, transactions: [UNRELATED_TX_HASH] })
          outcome = await outcomeOf(withoutHash([transaction([log({ index: 3, account: undefined })])]))
        })

        it('should throw so alchemy retries the delivery', () => {
          expect((outcome as Error).message).toContain('Could not read delegation logs on chain yet')
          expect((outcome as Error).message).toContain(
            `the node's block ${BLOCK_NUMBER} (${NODE_FORK_HASH}) does not include 1 delivered transaction(s)`
          )
          expect((outcome as Error).message).toContain(`${TX_HASH}#3 ${DELEGATOR} -> ${DELEGATE}`)
        })

        it('should not record or drop anything', () => {
          expect(delegationSet).not.toHaveBeenCalled()
          expect(report).not.toHaveBeenCalled()
        })
      })

      describe('alongside a transaction the node block does confirm', () => {
        let outcome: unknown

        beforeEach(async () => {
          const confirmed = log({ index: 1, account: undefined })
          const missing = log({ index: 5, account: undefined })
          nodeHoldsAtHeight({ hash: BLOCK_HASH, transactions: [TX_HASH] }, chainLog(confirmed))
          outcome = await outcomeOf(
            withoutHash([transaction([confirmed], TX_HASH), transaction([missing], OTHER_TX_HASH)])
          )
        })

        // The delivery is settled all at once, so the retry starts from scratch.
        it('should retry the whole delivery without writing the confirmed one yet', () => {
          expect((outcome as Error).message).toContain('Could not read delegation logs on chain yet')
          expect(delegationSet).not.toHaveBeenCalled()
        })
      })

      describe('and alchemy retries once the node has caught up', () => {
        let outcome: unknown

        beforeEach(async () => {
          const genuine = log({ index: 3, account: undefined })
          const delivery = withoutHash([transaction([genuine])])
          nodeHoldsAtHeight({ hash: NODE_FORK_HASH, transactions: [UNRELATED_TX_HASH] })
          await outcomeOf(delivery)
          nodeHoldsAtHeight({ hash: BLOCK_HASH, transactions: [TX_HASH] }, chainLog(genuine))
          outcome = await outcomeOf(delivery)
        })

        it('should record the delegation exactly once', () => {
          expect(delegationSet).toHaveBeenCalledTimes(1)
          expect(outcome).toBe('resolved')
        })
      })

      describe('past the grace period', () => {
        let outcome: unknown

        beforeEach(async () => {
          nodeHoldsAtHeight({ hash: NODE_FORK_HASH, transactions: [UNRELATED_TX_HASH], timestamp: STALE_AT })
          outcome = await outcomeOf(withoutHash([transaction([log({ account: undefined })])], STALE_AT))
        })

        it('should drop the log and report which block the node held', () => {
          expect(outcome).toBe('resolved')
          expect(delegationSet).not.toHaveBeenCalled()
          expect(droppedLogs()).toEqual([
            expect.objectContaining({
              transaction_hash: TX_HASH,
              reason: `transaction is not in the node's block at that height (${NODE_FORK_HASH})`,
            }),
          ])
        })
      })
    })

    describe('and the node does not have that height yet', () => {
      let outcome: unknown

      beforeEach(async () => {
        getBlock.mockResolvedValue(null)
        outcome = await outcomeOf(withoutHash([transaction([log()])]))
      })

      it('should throw so alchemy retries the delivery', () => {
        expect((outcome as Error).message).toContain('Could not read delegation logs on chain yet')
        expect((outcome as Error).message).toContain(`block ${BLOCK_NUMBER} not found`)
        expect(getLogs).not.toHaveBeenCalled()
      })
    })

    describe('and no block number either', () => {
      let outcome: unknown

      beforeEach(async () => {
        const nameless = { ...withoutHash([transaction([log()])]), number: undefined } as unknown as AlchemyBlock
        outcome = await outcomeOf(nameless)
      })

      it('should drop the logs without querying the RPC, since a retry carries the same payload', () => {
        expect(outcome).toBe('resolved')
        expect(getEnvironmentProvider).not.toHaveBeenCalled()
        expect(droppedLogs()).toEqual([expect.objectContaining({ reason: 'delivery names no block' })])
      })
    })
  })
})
