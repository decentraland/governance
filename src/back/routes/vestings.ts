import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { VestingInfo, getVestingContractData } from '../../clients/VestingData'
import { validateAddress } from '../utils/validations'

export default routes((router) => {
  router.post('/vesting', handleAPI(getVestingInfo))
})

const compareVestingInfo = (a: VestingInfo, b: VestingInfo): number => {
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

async function getVestingInfo(req: Request<any, any, { addresses: string[] }>): Promise<VestingInfo[]> {
  const addresses = req.body.addresses
  addresses.forEach(validateAddress)

  const vestings = await Promise.all(addresses.map((address) => getVestingContractData(address)))

  return vestings.sort(compareVestingInfo)
}
