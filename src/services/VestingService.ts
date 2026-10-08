import {
  Vesting,
  VestingLog,
  VestingWithLogs,
  getInitialVestingStatus,
  getTokenSymbolFromAddress,
  getVestingDates,
  getVestingWithLogsFromAlchemy,
  sortByTimestamp,
  toISOString,
} from '../clients/VestingData'
import { SubgraphVesting } from '../clients/VestingSubgraphTypes'
import { VestingsSubgraph } from '../clients/VestingsSubgraph'
import { VestingStatus } from '../entities/Grant/types'
import { ContractVersion, TopicsByVersion } from '../utils/contracts/vesting'
import { ErrorCategory } from '../utils/errorCategories'

import CacheService, { TTL_1_HS } from './CacheService'
import { ErrorService } from './ErrorService'

export const MAX_CONCURRENT_VESTING_FALLBACKS = 5

// The subgraph sets `version` to 1 for a V1 contract (TokenVesting) and 2 for a V2 one (PeriodicTokenVesting). `linear`
// does not tell them apart: a V2 contract can be linear too.
function isV1Vesting(vestingData: SubgraphVesting) {
  return Number(vestingData.version) === 1
}

// A V1 contract emits `Released(released)`: the running total released so far, not the amount of that release.
// Subgraph deployment QmV6EB6uq5548oCdcjYU3pz1jLwwkSoKUg6DY5dZrAgvTN stores that total as the release log amount and
// adds those totals up into the vesting's `released`. This turns a V1 vesting's logs back into the amount of each
// release (oldest first). Remove it once the subgraph stores per-release amounts for V1, or they get subtracted twice.
function getReleaseAmounts(vestingData: SubgraphVesting) {
  const releases = vestingData.releaseLogs
    .map((releaseLog) => ({ timestamp: Number(releaseLog.timestamp), amount: Number(releaseLog.amount) }))
    .sort((a, b) => a.timestamp - b.timestamp)
  if (!isV1Vesting(vestingData)) {
    return releases
  }

  let releasedSoFar = 0
  return releases.map(({ timestamp, amount: total }) => {
    const amount = total - releasedSoFar
    releasedSoFar = total
    return { timestamp, amount }
  })
}

// For a V1 vesting the latest running total is what has been released; the subgraph's `released` is a sum of totals
function getReleased(vestingData: SubgraphVesting) {
  if (!isV1Vesting(vestingData)) {
    return Number(vestingData.released)
  }
  return vestingData.releaseLogs.reduce((released, releaseLog) => Math.max(released, Number(releaseLog.amount)), 0)
}

export class VestingService {
  static async getAllVestings(): Promise<VestingWithLogs[]> {
    const cacheKey = `vesting-subgraph-data`

    const cachedData = CacheService.get<VestingWithLogs[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }
    const vestingsData = await VestingsSubgraph.get().getVestings()
    const sortedVestings = vestingsData
      .map((data) => this.parseSubgraphVesting(data))
      .sort((a, b) => this.sortVestingsByDate(a, b))
    CacheService.set(cacheKey, sortedVestings, TTL_1_HS)
    return sortedVestings
  }

  static async getVestings(addresses: string[]): Promise<VestingWithLogs[]> {
    if (!addresses?.length) return []

    const norm = (a: string) => (a.startsWith('0x') ? a : `0x${a}`).toLowerCase()
    const input = [...new Set(addresses.map(norm))]

    const sg = await VestingsSubgraph.get().getVestings(input)
    const sgById = new Map(sg.map((v) => [v.id.toLowerCase(), v]))
    const missing = input.filter((a) => !sgById.has(a))

    const fallback: Array<VestingWithLogs | null> = []
    for (let index = 0; index < missing.length; index += MAX_CONCURRENT_VESTING_FALLBACKS) {
      const batch = missing.slice(index, index + MAX_CONCURRENT_VESTING_FALLBACKS)
      const results = await Promise.all(batch.map((address) => this.getVestingWithLogs(address).catch(() => null)))
      fallback.push(...results)
    }
    const okFallback = fallback.filter((x): x is VestingWithLogs => x !== null)

    const parsedFromSubgraph = sg.map(this.parseSubgraphVesting)
    return [...parsedFromSubgraph, ...okFallback].sort(this.sortVestingsByDate)
  }

  static async getVestingsWithRecentlyEndedCliffs(): Promise<VestingWithLogs[]> {
    const vestingsData = await VestingsSubgraph.get().getVestingsWithRecentlyEndedCliffs()
    return vestingsData.map(this.parseSubgraphVesting)
  }

  // `includeLogs: false` lets callers that only need the vesting data skip the contract logs scan when the vesting is
  // missing from the subgraph (the subgraph always includes its logs)
  static async getVestingWithLogs(
    vestingAddress: string | null | undefined,
    proposalId?: string,
    { includeLogs = true }: { includeLogs?: boolean } = {}
  ): Promise<VestingWithLogs> {
    if (!vestingAddress || vestingAddress.length === 0) {
      throw new Error('Unable to fetch vesting data for empty contract address')
    }

    try {
      return await this.getVestingWithLogsFromSubgraph(vestingAddress, proposalId)
    } catch (error) {
      return await getVestingWithLogsFromAlchemy(vestingAddress, proposalId, includeLogs)
    }
  }

  private static async getVestingWithLogsFromSubgraph(
    vestingAddress: string,
    proposalId?: string
  ): Promise<VestingWithLogs> {
    try {
      const subgraphVesting = await VestingsSubgraph.get().getVesting(vestingAddress)
      return this.parseSubgraphVesting(subgraphVesting)
    } catch (error) {
      ErrorService.report('Unable to fetch vestings subgraph data', {
        error,
        vestingAddress,
        proposalId,
        category: ErrorCategory.Vesting,
      })
      throw error
    }
  }

  private static parseSubgraphVesting(vestingData: SubgraphVesting) {
    const vestingContract = VestingService.parseVestingData(vestingData)
    const logs = VestingService.parseVestingLogs(vestingData)
    return { ...vestingContract, logs }
  }

  private static parseVestingData(vestingData: SubgraphVesting): Vesting {
    const contractStart = Number(vestingData.start)
    const contractDuration = Number(vestingData.duration)
    const cliffEnd = Number(vestingData.cliff)
    const currentTime = Math.floor(Date.now() / 1000)

    const start_at = toISOString(contractStart)
    const contractEndsTimestamp = contractStart + contractDuration
    const finish_at = toISOString(contractEndsTimestamp)

    const released = getReleased(vestingData)
    const total = Number(vestingData.total)
    let vested = 0

    if (currentTime < cliffEnd) {
      // If we're before the cliff end, nothing is vested
      vested = 0
    } else if (vestingData.linear) {
      // Linear vesting after the cliff
      if (currentTime >= contractEndsTimestamp) {
        vested = total
      } else {
        const timeElapsed = currentTime - contractStart
        vested = (timeElapsed / contractDuration) * total
      }
    } else {
      // Periodic vesting after the cliff
      const periodDuration = Number(vestingData.periodDuration)
      let timeVested = currentTime - contractStart

      // Adjust for pauses (we only use the latest pause log. If unpaused, it resumes as if it'd have never been paused)
      if (vestingData.paused) {
        if (vestingData.pausedLogs && vestingData.pausedLogs.length > 0) {
          const latestPauseLog = vestingData.pausedLogs.reduce((latestLog, currentLog) => {
            return Number(currentLog.timestamp) > Number(latestLog.timestamp) ? currentLog : latestLog
          }, vestingData.pausedLogs[0])
          const pauseTimestamp = Number(latestPauseLog.timestamp)
          if (currentTime >= pauseTimestamp) {
            timeVested = pauseTimestamp - contractStart
          }
        }
      }

      const periodsCompleted = Math.floor(timeVested / periodDuration)

      // Sum vested tokens for completed periods
      for (let i = 0; i < periodsCompleted && i < vestingData.vestedPerPeriod.length; i++) {
        vested += Number(vestingData.vestedPerPeriod[i])
      }
    }

    const releasable = vested - released

    let status = getInitialVestingStatus(start_at, finish_at)
    if (vestingData.revoked) {
      status = VestingStatus.Revoked
    } else if (vestingData.paused) {
      status = VestingStatus.Paused
    }

    const token = getTokenSymbolFromAddress(vestingData.token)

    return {
      address: vestingData.id.toLowerCase(),
      cliff: toISOString(cliffEnd),
      vestedPerPeriod: vestingData.vestedPerPeriod.map(Number),
      ...getVestingDates(contractStart, contractEndsTimestamp),
      vested,
      released,
      releasable,
      total,
      token,
      status,
      start_at,
      finish_at,
    }
  }

  private static parseVestingLogs(vestingData: SubgraphVesting) {
    const version = isV1Vesting(vestingData) ? ContractVersion.V1 : ContractVersion.V2
    const topics = TopicsByVersion[version]
    const logs: VestingLog[] = []
    const parsedReleases: VestingLog[] = getReleaseAmounts(vestingData).map(({ timestamp, amount }) => {
      return {
        topic: topics.RELEASE,
        timestamp: toISOString(timestamp),
        amount,
      }
    })
    logs.push(...parsedReleases)
    const parsedPauseEvents: VestingLog[] = vestingData.pausedLogs.map((pausedLog) => {
      return {
        topic: pausedLog.eventType === 'Paused' ? topics.PAUSED : topics.UNPAUSED,
        timestamp: toISOString(Number(pausedLog.timestamp)),
      }
    })
    logs.push(...parsedPauseEvents)
    return logs.sort(sortByTimestamp)
  }

  private static sortVestingsByDate(a: VestingWithLogs, b: VestingWithLogs): number {
    if (a.logs.length === 0 && b.logs.length === 0) {
      return new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
    }

    if (a.logs.length === 0) {
      return -1
    }

    if (b.logs.length === 0) {
      return 1
    }

    const aLatestLogTimestamp = new Date(a.logs[0].timestamp).getTime()
    const bLatestLogTimestamp = new Date(b.logs[0].timestamp).getTime()

    return bLatestLogTimestamp - aLatestLogTimestamp
  }
}
