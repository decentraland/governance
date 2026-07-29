import { SubgraphVesting } from '../clients/VestingSubgraphTypes'
import { VestingsSubgraph } from '../clients/VestingsSubgraph'
import { VestingStatus } from '../entities/Grant/types'

import { MAX_CONCURRENT_VESTING_FALLBACKS, VestingService } from './VestingService'

const VESTING_ADDRESS = '0x1111111111111111111111111111111111111111'
const OTHER_ADDRESS = '0x2222222222222222222222222222222222222222'
const DAY = 24 * 60 * 60

const now = Math.floor(Date.now() / 1000)

// A vesting that started 100 days ago and runs for 200, so "now" sits halfway through it.
function subgraphVesting(overrides: Partial<SubgraphVesting> = {}): SubgraphVesting {
  return {
    id: VESTING_ADDRESS,
    version: 2,
    duration: String(200 * DAY),
    cliff: String(now - 90 * DAY),
    beneficiary: '0x3333333333333333333333333333333333333333',
    revoked: false,
    revocable: true,
    released: '0',
    start: String(now - 100 * DAY),
    periodDuration: String(30 * DAY),
    vestedPerPeriod: ['100', '100', '100', '100', '100', '100'],
    paused: false,
    pausable: true,
    stop: '0',
    linear: false,
    token: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    owner: '0x4444444444444444444444444444444444444444',
    total: '600',
    releaseLogs: [],
    pausedLogs: [],
    revokeTimestamp: BigInt(0),
    ...overrides,
  }
}

// parseSubgraphVesting is private; this is the thinnest public route to it, since it only maps.
async function parse(vesting: SubgraphVesting) {
  jest
    .spyOn(VestingsSubgraph, 'get')
    .mockReturnValue({ getVestingsWithRecentlyEndedCliffs: jest.fn().mockResolvedValue([vesting]) } as never)
  const [parsed] = await VestingService.getVestingsWithRecentlyEndedCliffs()
  return parsed
}

describe('VestingService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the cliff has not been reached yet', () => {
    it('should report nothing as vested, however much time has passed', async () => {
      const parsed = await parse(subgraphVesting({ cliff: String(now + 10 * DAY) }))
      expect(parsed.vested).toBe(0)
    })

    it('should still owe nothing, since nothing has vested', async () => {
      const parsed = await parse(subgraphVesting({ cliff: String(now + 10 * DAY) }))
      expect(parsed.releasable).toBe(0)
    })
  })

  describe('when the vesting is linear and past its cliff', () => {
    it('should vest in proportion to the time elapsed', async () => {
      const parsed = await parse(subgraphVesting({ linear: true }))
      expect(Math.round(parsed.vested)).toBe(300)
    })

    // Past the end the proportion would exceed one, so it is capped rather than over-vesting.
    it('should stop at the total once the contract has finished', async () => {
      const parsed = await parse(
        subgraphVesting({ linear: true, start: String(now - 300 * DAY), cliff: String(now - 290 * DAY) })
      )
      expect(parsed.vested).toBe(600)
    })
  })

  describe('when the vesting is periodic', () => {
    // Three whole 30-day periods have completed in the 100 days since it started.
    it('should vest only the periods that have completed', async () => {
      const parsed = await parse(subgraphVesting())
      expect(parsed.vested).toBe(300)
    })

    it('should not vest beyond the periods it was given', async () => {
      const parsed = await parse(subgraphVesting({ vestedPerPeriod: ['100', '100'] }))
      expect(parsed.vested).toBe(200)
    })

    it('should subtract what has already been released', async () => {
      const parsed = await parse(subgraphVesting({ released: '120' }))
      expect(parsed.releasable).toBe(180)
    })
  })

  // Pausing freezes the clock, so a paused contract must not keep vesting while it is stopped.
  describe('when a periodic vesting is paused', () => {
    const pausedAt = String(now - 50 * DAY)

    it('should count only the periods completed before the pause', async () => {
      const parsed = await parse(
        subgraphVesting({ paused: true, pausedLogs: [{ timestamp: pausedAt, eventType: 'Paused' }] as never })
      )
      expect(parsed.vested).toBe(100)
    })

    it('should take the latest pause when several are recorded', async () => {
      const parsed = await parse(
        subgraphVesting({
          paused: true,
          pausedLogs: [
            { timestamp: String(now - 80 * DAY), eventType: 'Paused' },
            { timestamp: pausedAt, eventType: 'Paused' },
          ] as never,
        })
      )
      expect(parsed.vested).toBe(100)
    })

    it('should keep vesting normally when it carries no pause log', async () => {
      const parsed = await parse(subgraphVesting({ paused: true }))
      expect(parsed.vested).toBe(300)
    })
  })

  describe('when reporting the status', () => {
    it('should report a running vesting as in progress', async () => {
      const parsed = await parse(subgraphVesting())
      expect(parsed.status).toBe(VestingStatus.InProgress)
    })

    it('should report a paused vesting as paused', async () => {
      const parsed = await parse(subgraphVesting({ paused: true }))
      expect(parsed.status).toBe(VestingStatus.Paused)
    })

    // Revocation is terminal, so it wins over a pause that is also set.
    it('should report a revoked vesting as revoked even when it is also paused', async () => {
      const parsed = await parse(subgraphVesting({ revoked: true, paused: true }))
      expect(parsed.status).toBe(VestingStatus.Revoked)
    })
  })

  describe('when parsing the logs', () => {
    it('should return them newest first regardless of the order they arrive in', async () => {
      const parsed = await parse(
        subgraphVesting({
          releaseLogs: [
            { timestamp: String(now - 10 * DAY), amount: '50' },
            { timestamp: String(now - 80 * DAY), amount: '20' },
          ] as never,
          pausedLogs: [{ timestamp: String(now - 40 * DAY), eventType: 'Paused' }] as never,
        })
      )
      const timestamps = parsed.logs.map((log) => new Date(log.timestamp).getTime())
      expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a))
    })

    it('should include both the releases and the pause events', async () => {
      const parsed = await parse(
        subgraphVesting({
          releaseLogs: [{ timestamp: String(now - 10 * DAY), amount: '50' }] as never,
          pausedLogs: [{ timestamp: String(now - 40 * DAY), eventType: 'Paused' }] as never,
        })
      )
      expect(parsed.logs).toHaveLength(2)
    })

    it('should distinguish a pause from an unpause', async () => {
      const parsed = await parse(
        subgraphVesting({
          pausedLogs: [
            { timestamp: String(now - 40 * DAY), eventType: 'Paused' },
            { timestamp: String(now - 20 * DAY), eventType: 'Unpaused' },
          ] as never,
        })
      )
      expect(parsed.logs[0].topic).not.toBe(parsed.logs[1].topic)
    })
  })

  describe('VestingService.getVestings', () => {
    describe('when no addresses are given', () => {
      it('should return nothing without querying', async () => {
        const getVestings = jest.fn()
        jest.spyOn(VestingsSubgraph, 'get').mockReturnValue({ getVestings } as never)
        expect(await VestingService.getVestings([])).toEqual([])
        expect(getVestings).not.toHaveBeenCalled()
      })
    })

    describe('when the same address is given more than once, in mixed case', () => {
      let getVestings: jest.Mock

      beforeEach(async () => {
        getVestings = jest.fn().mockResolvedValue([])
        jest.spyOn(VestingsSubgraph, 'get').mockReturnValue({ getVestings } as never)
        jest.spyOn(VestingService, 'getVestingWithLogs').mockRejectedValue(new Error('not found'))
        await VestingService.getVestings([VESTING_ADDRESS, VESTING_ADDRESS.toUpperCase().replace('0X', '0x')])
      })

      it('should ask for it once, lowercased', () => {
        expect(getVestings).toHaveBeenCalledWith([VESTING_ADDRESS])
      })
    })

    describe('when an address is missing from the subgraph', () => {
      let result: Awaited<ReturnType<typeof VestingService.getVestings>>

      beforeEach(async () => {
        jest
          .spyOn(VestingsSubgraph, 'get')
          .mockReturnValue({ getVestings: jest.fn().mockResolvedValue([subgraphVesting()]) } as never)
        jest
          .spyOn(VestingService, 'getVestingWithLogs')
          .mockResolvedValue({ address: OTHER_ADDRESS, logs: [], start_at: new Date().toISOString() } as never)
        result = await VestingService.getVestings([VESTING_ADDRESS, OTHER_ADDRESS])
      })

      it('should fall back to fetching it directly', () => {
        expect(VestingService.getVestingWithLogs).toHaveBeenCalledWith(OTHER_ADDRESS)
      })

      it('should return both the subgraph and the fallback results', () => {
        expect(result).toHaveLength(2)
      })
    })

    // One address failing everywhere must not lose the ones that resolved.
    describe('when the fallback also fails for an address', () => {
      let result: Awaited<ReturnType<typeof VestingService.getVestings>>

      beforeEach(async () => {
        jest
          .spyOn(VestingsSubgraph, 'get')
          .mockReturnValue({ getVestings: jest.fn().mockResolvedValue([subgraphVesting()]) } as never)
        jest.spyOn(VestingService, 'getVestingWithLogs').mockRejectedValue(new Error('nowhere to be found'))
        result = await VestingService.getVestings([VESTING_ADDRESS, OTHER_ADDRESS])
      })

      it('should drop the one that could not be resolved', () => {
        expect(result).toHaveLength(1)
      })

      it('should still return the one that could', () => {
        expect(result[0].address).toBe(VESTING_ADDRESS)
      })
    })

    describe('when several addresses need the fallback', () => {
      let addresses: string[]
      let activeFallbacks: number
      let maximumActiveFallbacks: number

      beforeEach(async () => {
        addresses = Array.from(
          { length: MAX_CONCURRENT_VESTING_FALLBACKS + 1 },
          (_, index) => `0x${(index + 1).toString(16).padStart(40, '0')}`
        )
        activeFallbacks = 0
        maximumActiveFallbacks = 0
        jest.spyOn(VestingsSubgraph, 'get').mockReturnValue({
          getVestings: jest.fn().mockResolvedValue([]),
        } as never)
        jest.spyOn(VestingService, 'getVestingWithLogs').mockImplementation(async (address) => {
          activeFallbacks += 1
          maximumActiveFallbacks = Math.max(maximumActiveFallbacks, activeFallbacks)
          await new Promise<void>((resolve) => setImmediate(resolve))
          activeFallbacks -= 1
          return { address, logs: [], start_at: new Date().toISOString() } as never
        })

        await VestingService.getVestings(addresses)
      })

      it('should limit concurrent fallback lookups', () => {
        expect(maximumActiveFallbacks).toBe(MAX_CONCURRENT_VESTING_FALLBACKS)
      })
    })
  })

  describe('VestingService.getVestingWithLogs', () => {
    describe('when the address is empty', () => {
      it('should refuse rather than query for nothing', async () => {
        await expect(VestingService.getVestingWithLogs('')).rejects.toThrow('empty contract address')
      })

      it('should refuse a null address too', async () => {
        await expect(VestingService.getVestingWithLogs(null)).rejects.toThrow('empty contract address')
      })
    })

    describe('when the subgraph has the vesting', () => {
      it('should return it parsed', async () => {
        jest
          .spyOn(VestingsSubgraph, 'get')
          .mockReturnValue({ getVesting: jest.fn().mockResolvedValue(subgraphVesting()) } as never)
        const parsed = await VestingService.getVestingWithLogs(VESTING_ADDRESS)
        expect(parsed.address).toBe(VESTING_ADDRESS)
      })
    })
  })
})
