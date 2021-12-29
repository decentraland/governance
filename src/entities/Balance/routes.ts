import routes from "decentraland-gatsby/dist/entities/Route/routes";
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import { getAggregatedBalances } from './utils'

export default routes((route) => {
  route.get('/balances', handleAPI(getBalances))
})

export async function getBalances() {
  return getAggregatedBalances()
}
