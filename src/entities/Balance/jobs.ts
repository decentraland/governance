import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import { getBalances } from './utils'

export async function fetchBalances(context: JobContext) {
  const newBalances = await getBalances()
  context.log(newBalances ? `Created ${newBalances.length} balances` : "No new balances created")
}

