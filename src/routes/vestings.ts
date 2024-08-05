import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { VestingWithLogs } from '../clients/VestingData'
import { VestingService } from '../services/VestingService'
import { validateAddress } from '../utils/validations'

export default routes((router) => {
  router.get('/all-vestings', handleAPI(getAllVestings))
  router.post('/vesting', handleAPI(getVestings))
  router.get('/vesting/:address', handleAPI(getVesting))
})

async function getAllVestings() {
  return await VestingService.getAllVestings()
}

async function getVestings(req: Request<unknown, unknown, { addresses: string[] }>): Promise<VestingWithLogs[]> {
  const addresses = req.body.addresses
  addresses.forEach(validateAddress)

  return await VestingService.getVestings(addresses)
}

async function getVesting(req: Request<{ address: string }>) {
  const address = validateAddress(req.params.address)
  return await VestingService.getVestingWithLogs(address)
}
