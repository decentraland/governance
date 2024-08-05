import { Transparency, TransparencyVesting } from '../clients/Transparency'
import { VestingWithLogs, parseVestingData, parseVestingLogs } from '../clients/VestingData'
import { SubgraphVesting } from '../clients/VestingSubgraphTypes'
import { VestingsSubgraph } from '../clients/VestingsSubgraph'
import { ErrorCategory } from '../utils/errorCategories'

import CacheService, { TTL_24_HS } from './CacheService'
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

  static async getVestings(addresses: string[]): Promise<VestingWithLogs[]> {
    const vestingsData = await VestingsSubgraph.get().getVestings(addresses)
    return vestingsData.map(this.parseSubgraphVesting).sort(compareVestingInfo)
  }

  static async getVestingWithLogs(
    vestingAddress: string | null | undefined,
    proposalId?: string
  ): Promise<VestingWithLogs> {
    if (!vestingAddress || vestingAddress.length === 0) {
      throw new Error('Unable to fetch vesting data for empty contract address')
    }

    return await this.getVestingWithLogsFromSubgraph(vestingAddress, proposalId)
  }

  private static async getVestingWithLogsFromSubgraph(
    vestingAddress: string,
    proposalId?: string
  ): Promise<VestingWithLogs> {
    try {
      const subgraphVesting = await VestingsSubgraph.get().getVesting(vestingAddress)
      return this.parseSubgraphVesting(subgraphVesting)
    } catch (error) {
      console.log('Unable to fetch vestings subgraph data', error) //TODO: remove before merging to master
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
    const vestingContract = parseVestingData(vestingData)
    const logs = parseVestingLogs(vestingData)
    return { ...vestingContract, logs }
  }
}

function compareVestingInfo(a: VestingWithLogs, b: VestingWithLogs): number {
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
