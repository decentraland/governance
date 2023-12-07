import { DclData, TransparencyVesting } from '../clients/DclData'
import { VestingInfo, getVestingContractData } from '../clients/VestingData'

import CacheService, { TTL_24_HS } from './CacheService'

export class VestingService {
  static async getAllVestings() {
    const cacheKey = `vesting-data`

    const cachedData = CacheService.get<TransparencyVesting[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const transparencyVestings = await DclData.get().getVestings()
    CacheService.set(cacheKey, transparencyVestings, TTL_24_HS)
    return transparencyVestings
  }

  static async getVestingInfo(addresses: string[]): Promise<VestingInfo[]> {
    const vestings = await Promise.all(addresses.map((address) => getVestingContractData(address)))

    return vestings.sort(compareVestingInfo)
  }
}

function compareVestingInfo(a: VestingInfo, b: VestingInfo): number {
  if (a.logs.length === 0 && b.logs.length === 0) {
    return new Date(b.vestingStartAt).getTime() - new Date(a.vestingStartAt).getTime()
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
