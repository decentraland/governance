import EventModel from '../models/Event'

import { SNAPSHOT_DELEGATION_REGISTRY, UNRELATED_CONTRACT, blockWithLogs, log } from './delegationTestHelpers'
import { EventsService } from './events'

// DELEGATION_REGISTRY_ENFORCED is read once at import, so the flag is pinned per test file rather
// than per test. This file covers the fail-closed side; events.test.ts covers the default.
jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DELEGATION_REGISTRY_ENFORCED: true,
}))

describe('EventsService.delegationUpdate', () => {
  let delegationSet: jest.SpyInstance

  beforeEach(() => {
    jest.spyOn(EventModel, 'isDelegationTxRegistered').mockResolvedValue(false)
    delegationSet = jest.spyOn(EventsService, 'delegationSet').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the delegation registry check is enforced', () => {
    describe('and the emitting contract is the snapshot delegate registry', () => {
      beforeEach(async () => {
        await EventsService.delegationUpdate(blockWithLogs([log()]))
      })

      it('should record the delegation', () => {
        expect(delegationSet).toHaveBeenCalledTimes(1)
      })
    })

    describe('and the emitting contract is another contract', () => {
      beforeEach(async () => {
        await EventsService.delegationUpdate(blockWithLogs([log({ account: { address: UNRELATED_CONTRACT } })]))
      })

      it('should reject the forged look-alike log', () => {
        expect(delegationSet).not.toHaveBeenCalled()
      })
    })

    describe('and the payload does not carry the emitting contract', () => {
      beforeEach(async () => {
        await EventsService.delegationUpdate(blockWithLogs([log({ account: undefined })]))
      })

      // The difference from the default mode: without an emitter to verify, the log is dropped
      // rather than trusted.
      it('should fail closed and drop the unverifiable log', () => {
        expect(delegationSet).not.toHaveBeenCalled()
      })
    })

    describe('and the emitting contract is the registry in a different case', () => {
      beforeEach(async () => {
        await EventsService.delegationUpdate(
          blockWithLogs([log({ account: { address: SNAPSHOT_DELEGATION_REGISTRY.toLowerCase() } })])
        )
      })

      it('should still record the delegation, since address equality is case-insensitive', () => {
        expect(delegationSet).toHaveBeenCalledTimes(1)
      })
    })
  })
})
