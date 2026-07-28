import EventModel from '../models/Event'

import {
  BLOCK_TIMESTAMP,
  CLEAR_DELEGATE_SIGNATURE_HASH,
  DELEGATE,
  DELEGATOR,
  OTHER_SPACE_TOPIC,
  OTHER_TX_HASH,
  SET_DELEGATE_SIGNATURE_HASH,
  SNAPSHOT_DELEGATION_REGISTRY,
  SPACE_TOPIC,
  TX_HASH,
  UNRELATED_CONTRACT,
  addressTopic,
  block,
  blockWithLogs,
  log,
  transaction,
} from './delegationTestHelpers'
import { EventsService } from './events'

describe('EventsService.delegationUpdate', () => {
  let delegationSet: jest.SpyInstance
  let delegationClear: jest.SpyInstance

  beforeEach(() => {
    jest.spyOn(EventModel, 'isDelegationTxRegistered').mockResolvedValue(false)
    delegationSet = jest.spyOn(EventsService, 'delegationSet').mockResolvedValue(undefined)
    delegationClear = jest.spyOn(EventsService, 'delegationClear').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the transaction was already registered', () => {
    beforeEach(async () => {
      ;(EventModel.isDelegationTxRegistered as jest.Mock).mockResolvedValue(true)
      await EventsService.delegationUpdate(blockWithLogs([log()]))
    })

    it('should not record the delegation a second time', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the log topics are not an array', () => {
    let outcome: unknown

    beforeEach(async () => {
      outcome = await EventsService.delegationUpdate(blockWithLogs([log({ topics: undefined })]))
        .then(() => 'resolved')
        .catch((error) => error)
    })

    it('should skip the log instead of throwing', () => {
      expect(outcome).toBe('resolved')
    })

    it('should not record a delegation', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the log has fewer than four topics', () => {
    let outcome: unknown

    beforeEach(async () => {
      outcome = await EventsService.delegationUpdate(
        blockWithLogs([log({ topics: [SET_DELEGATE_SIGNATURE_HASH, addressTopic(DELEGATOR)] })])
      )
        .then(() => 'resolved')
        .catch((error) => error)
    })

    it('should skip the log instead of throwing on the short topic array', () => {
      expect(outcome).toBe('resolved')
    })

    it('should not record a delegation', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the log signature is unrelated to delegation', () => {
    beforeEach(async () => {
      const topics = [
        '0x00000000000000000000000000000000000000000000000000000000deadbeef',
        addressTopic(DELEGATOR),
        SPACE_TOPIC,
        addressTopic(DELEGATE),
      ]
      await EventsService.delegationUpdate(blockWithLogs([log({ topics })]))
    })

    it('should not record a delegation', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the emitting contract is not the snapshot delegate registry', () => {
    beforeEach(async () => {
      await EventsService.delegationUpdate(blockWithLogs([log({ account: { address: UNRELATED_CONTRACT } })]))
    })

    it('should reject the forged look-alike log', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the payload does not carry the emitting contract', () => {
    beforeEach(async () => {
      await EventsService.delegationUpdate(blockWithLogs([log({ account: undefined })]))
    })

    // Best-effort mode: the Alchemy query has to request `account { address }` before the check can
    // be enforced, so a missing emitter is tolerated rather than dropping every real delegation.
    it('should still record the delegation', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the emitting contract is the registry in a different case', () => {
    beforeEach(async () => {
      await EventsService.delegationUpdate(
        blockWithLogs([log({ account: { address: SNAPSHOT_DELEGATION_REGISTRY.toLowerCase() } })])
      )
    })

    it('should accept it, since address equality is case-insensitive', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the delegator topic is not a valid address', () => {
    let outcome: unknown

    beforeEach(async () => {
      const topics = [SET_DELEGATE_SIGNATURE_HASH, '0x' + 'g'.repeat(64), SPACE_TOPIC, addressTopic(DELEGATE)]
      outcome = await EventsService.delegationUpdate(blockWithLogs([log({ topics })]))
        .then(() => 'resolved')
        .catch((error) => error)
    })

    it('should skip the log instead of letting the decode error escape', () => {
      expect(outcome).toBe('resolved')
    })

    it('should not record a delegation', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the space topic cannot be decoded', () => {
    let outcome: unknown

    beforeEach(async () => {
      const topics = [
        SET_DELEGATE_SIGNATURE_HASH,
        addressTopic(DELEGATOR),
        '0xnot-a-bytes32-value',
        addressTopic(DELEGATE),
      ]
      outcome = await EventsService.delegationUpdate(blockWithLogs([log({ topics })]))
        .then(() => 'resolved')
        .catch((error) => error)
    })

    it('should skip the log instead of letting the decode error escape', () => {
      expect(outcome).toBe('resolved')
    })

    it('should not record a delegation', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the log belongs to another snapshot space', () => {
    beforeEach(async () => {
      const topics = [SET_DELEGATE_SIGNATURE_HASH, addressTopic(DELEGATOR), OTHER_SPACE_TOPIC, addressTopic(DELEGATE)]
      await EventsService.delegationUpdate(blockWithLogs([log({ topics })]))
    })

    it('should not record a delegation for a space this instance does not track', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when the delegator and the delegate are the same address', () => {
    beforeEach(async () => {
      const topics = [
        SET_DELEGATE_SIGNATURE_HASH,
        addressTopic(DELEGATOR),
        SPACE_TOPIC,
        addressTopic(DELEGATOR.toUpperCase().replace('0X', '0x')),
      ]
      await EventsService.delegationUpdate(blockWithLogs([log({ topics })]))
    })

    it('should drop the self-delegation the real registry could never emit', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  describe('when a set delegate log is valid', () => {
    beforeEach(async () => {
      await EventsService.delegationUpdate(blockWithLogs([log({ index: 7 })]))
    })

    it('should record the delegation with the delegate, delegator and transaction hash', () => {
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should derive the creation date from the block timestamp and the log index', () => {
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, new Date(BLOCK_TIMESTAMP * 1000 + 7))
    })

    it('should not record a delegation clear', () => {
      expect(delegationClear).not.toHaveBeenCalled()
    })
  })

  describe('when a clear delegate log is valid', () => {
    beforeEach(async () => {
      const topics = [CLEAR_DELEGATE_SIGNATURE_HASH, addressTopic(DELEGATOR), SPACE_TOPIC, addressTopic(DELEGATE)]
      await EventsService.delegationUpdate(blockWithLogs([log({ topics })]))
    })

    it('should record the delegation clear with the removed delegate and delegator', () => {
      expect(delegationClear).toHaveBeenCalledWith(DELEGATE, DELEGATOR, TX_HASH, expect.any(Date))
    })

    it('should not record a delegation set', () => {
      expect(delegationSet).not.toHaveBeenCalled()
    })
  })

  // The regression these guards exist for: a throw used to abort the whole block, so Alchemy
  // re-delivered it indefinitely and every legitimate delegation inside it was wedged.
  describe('when a malformed log precedes a valid one in the same transaction', () => {
    beforeEach(async () => {
      await EventsService.delegationUpdate(
        blockWithLogs([log({ topics: [SET_DELEGATE_SIGNATURE_HASH] }), log({ index: 1 })])
      )
    })

    it('should still record the valid delegation that follows it', () => {
      expect(delegationSet).toHaveBeenCalledTimes(1)
    })
  })

  describe('when a malformed log sits in an earlier transaction than a valid one', () => {
    beforeEach(async () => {
      await EventsService.delegationUpdate(
        block([transaction([log({ topics: ['0x00'] })], TX_HASH), transaction([log({ index: 2 })], OTHER_TX_HASH)])
      )
    })

    it('should still record the delegation from the later transaction', () => {
      expect(delegationSet).toHaveBeenCalledWith(DELEGATE, DELEGATOR, OTHER_TX_HASH, expect.any(Date))
    })
  })
})
