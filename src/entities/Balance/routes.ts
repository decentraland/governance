import routes from 'decentraland-gatsby/dist/entities/Route/routes';
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import { aggregateBalances } from './utils'
import { AggregatedTokenBalance, BalanceAttributes } from './types'
import BalanceModel from './model'

export default routes((route) => {
  route.get('/balances', handleAPI(getBalances))
})

export async function getBalances(): Promise<AggregatedTokenBalance[]> {
  const latestBalances: BalanceAttributes[] = await BalanceModel.findLatestBalances()
  return await aggregateBalances(latestBalances)
}
