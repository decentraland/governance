import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { VestingInfo } from '../../clients/VestingData'
import { VestingService } from '../../services/VestingService'
import { validateAddress } from '../utils/validations'

export default routes((router) => {
  router.get('/all-vestings', handleAPI(getAllVestings))
  router.post('/vesting', handleAPI(getVestingInfo))
})

async function getAllVestings() {
  return await VestingService.getAllVestings()
}

async function getVestingInfo(req: Request<any, any, { addresses: string[] }>): Promise<VestingInfo[]> {
  const addresses = req.body.addresses
  addresses.forEach(validateAddress)

  return await VestingService.getVestingInfo(addresses)
}
