import { Wallet } from '@ethersproject/wallet'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'
import { Snapshot } from '../../api/Snapshot'
import snapshot from '@snapshot-labs/snapshot.js'

const SNAPSHOT_PRIVATE_KEY = requiredEnv('SNAPSHOT_PRIVATE_KEY')
export const SNAPSHOT_SPACE = requiredEnv('SNAPSHOT_SPACE')
export const SNAPSHOT_ADDRESS = requiredEnv('SNAPSHOT_ADDRESS')
export const SNAPSHOT_DURATION = Number(requiredEnv('SNAPSHOT_DURATION'))
export const SNAPSHOT_ACCOUNT = new Wallet(SNAPSHOT_PRIVATE_KEY)
export const SNAPSHOT_URL = requiredEnv('SNAPSHOT_URL')

export async function signMessage(wallet: Wallet, msg: string) {
  return wallet.signMessage(Buffer.from(msg, 'utf8'));
}

export async function getVotingPower(address?: string | null, space?: string | null){
  if (!address || !space) {
    return 0
  }
  const info = await Snapshot.get().getSpace(space)
  const vp: Record<string, number>[] = await snapshot.utils.getScores(space, info.strategies, info.network, null as any,[ address ])
  return vp.reduce((total, current) => {
    return total + Object.values(current).reduce((total, current) => total + (current | 0), 0)
  }, 0)
}

export async function hasRequiredVP(user:string, requiredVp:number){
  const userVp = await getVotingPower(user, SNAPSHOT_SPACE)
  return userVp >= requiredVp
}
