import { Account } from 'web3x/account/account'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'

const SNAPSHOT_PRIVATE_KEY = requiredEnv('SNAPSHOT_PRIVATE_KEY')
export const SNAPSHOT_SPACE = requiredEnv('SNAPSHOT_SPACE')
export const SNAPSHOT_ADDRESS = requiredEnv('SNAPSHOT_ADDRESS')
export const SNAPSHOT_DURATION = Number(requiredEnv('SNAPSHOT_DURATION'))
export const SNAPSHOT_ACCOUNT = Account.fromPrivate(Buffer.from(SNAPSHOT_PRIVATE_KEY, 'hex'))
export const SNAPSHOT_URL = requiredEnv('SNAPSHOT_URL')