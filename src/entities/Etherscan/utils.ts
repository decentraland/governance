import fetch from 'isomorphic-fetch'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'

const ETHERSCAN_API_KEY = requiredEnv('ETHERSCAN_API_KEY')
export async function getLatestBlockNumber(network: string) {
  console.log(`calling getLatestBlockNumber`)
  const url = new URL('https://api.etherscan.io/api')
  url.searchParams.set('module', 'proxy')
  url.searchParams.set('action', 'eth_blockNumber')
  url.searchParams.set('apikey', ETHERSCAN_API_KEY)

  const res = await fetch(url.toString())
  const body = await res.json() as { jsonrpc: string, id: number, result: string }
  return Number(body.result)
}
