import { Wallet } from '@ethersproject/wallet'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'

const SNAPSHOT_PRIVATE_KEY = requiredEnv('SNAPSHOT_PRIVATE_KEY')
export const SNAPSHOT_SPACE = requiredEnv('SNAPSHOT_SPACE')
export const SNAPSHOT_ADDRESS = requiredEnv('SNAPSHOT_ADDRESS')
export const SNAPSHOT_DURATION = Number(requiredEnv('SNAPSHOT_DURATION'))
export const SNAPSHOT_ACCOUNT = new Wallet(SNAPSHOT_PRIVATE_KEY)
export const SNAPSHOT_URL = requiredEnv('SNAPSHOT_URL')

export async function signMessage(wallet: Wallet, msg: string) {
  return wallet.signMessage(Buffer.from(msg, 'utf8'));
}