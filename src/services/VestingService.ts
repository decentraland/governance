import { Transparency, TransparencyVesting } from '../clients/Transparency'
import { VestingWithLogs, getVestingWithLogs } from '../clients/VestingData'

import CacheService, { TTL_24_HS } from './CacheService'

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
    const vestings = await Promise.all(addresses.map((address) => getVestingWithLogs(address)))

    return vestings.sort(compareVestingInfo)
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
