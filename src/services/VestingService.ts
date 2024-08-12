import { Transparency, TransparencyVesting } from '../clients/Transparency'
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

import CacheService, { TTL_1_HS, TTL_24_HS } from './CacheService'
import { ErrorService } from './ErrorService'

export class VestingService {
  static async getAllVestings() {
    const cacheKey = `vesting-data`

    const cachedData = CacheService.get<TransparencyVesting[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const transparencyVestings = await Transparency.getVestings()
    CacheService.set(cacheKey, transparencyVestings, TTL_24_HS)
    return transparencyVestings
  }

  static async getAllVestings2(): Promise<VestingWithLogs[]> {
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
    const vestingsData = await VestingsSubgraph.get().getVestings(addresses)
    const sortedVestings = vestingsData.map(this.parseSubgraphVesting).sort(this.sortVestingsByDate)
    return sortedVestings
  }

  static async getVestingWithLogs(
    vestingAddress: string | null | undefined,
    proposalId?: string
  ): Promise<VestingWithLogs> {
    if (!vestingAddress || vestingAddress.length === 0) {
      throw new Error('Unable to fetch vesting data for empty contract address')
    }

    try {
      return await this.getVestingWithLogsFromSubgraph(vestingAddress, proposalId)
    } catch (error) {
      return await getVestingWithLogsFromAlchemy(vestingAddress, proposalId)
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
    const vestingContract = this.parseVestingData(vestingData)
    const logs = this.parseVestingLogs(vestingData)
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

    const released = Number(vestingData.released)
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
      address: vestingData.id,
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
    const version = vestingData.linear ? ContractVersion.V1 : ContractVersion.V2
    const topics = TopicsByVersion[version]
    const logs: VestingLog[] = []
    const parsedReleases: VestingLog[] = vestingData.releaseLogs.map((releaseLog) => {
      return {
        topic: topics.RELEASE,
        timestamp: toISOString(Number(releaseLog.timestamp)),
        amount: Number(releaseLog.amount),
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
