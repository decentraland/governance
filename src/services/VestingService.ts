import { VestingInfo, getVestingContractData } from '../clients/VestingData'

export class VestingService {
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
