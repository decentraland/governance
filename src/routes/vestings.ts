import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { VestingWithLogs } from '../clients/VestingData'
import { VestingService } from '../services/VestingService'
import { validateAddress, validateBoundedAddresses } from '../utils/validations'

export const MAX_VESTING_ADDRESSES_PER_REQUEST = 100

export default routes((router) => {
  // Public: vesting data is displayed without authentication. Bulk input is capped here and
  // fallback RPC work is concurrency-limited in VestingService.
  router.get('/all-vestings', handleAPI(getAllVestings))
  router.post('/vesting', handleAPI(getVestings))
  router.get('/vesting/:address', handleAPI(getVesting))
})

async function getAllVestings() {
  return await VestingService.getAllVestings()
}

async function getVestings(req: Request<unknown, unknown, { addresses: string[] }>): Promise<VestingWithLogs[]> {
  const addresses = validateBoundedAddresses(req.body?.addresses, MAX_VESTING_ADDRESSES_PER_REQUEST)

  return await VestingService.getVestings(addresses)
}

async function getVesting(req: Request<{ address: string }>) {
  const address = validateAddress(req.params.address)
  return await VestingService.getVestingWithLogs(address)
}
