import { Wallet } from '@ethersproject/wallet'
import { Snapshot } from '../../api/Snapshot'
import snapshot from '@snapshot-labs/snapshot.js'

const SNAPSHOT_PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY || ''
export const SNAPSHOT_SPACE = process.env.GATBSBY_SNAPSHOT_SPACE || ''
export const SNAPSHOT_ADDRESS = process.env.GATBSBY_SNAPSHOT_ADDRESS || ''
export const SNAPSHOT_DURATION = Number(process.env.GATBSBY_SNAPSHOT_DURATION)
export const SNAPSHOT_ACCOUNT = new Wallet(SNAPSHOT_PRIVATE_KEY!)
export const SNAPSHOT_URL = process.env.GATBSBY_SNAPSHOT_URL

export async function signMessage(wallet: Wallet, msg: string) {
  return wallet.signMessage(Buffer.from(msg, 'utf8'));
}

export async function getVotingPower(address?: string | null, space?: string | null) {
  if (!address || !space) {
    return 0
  }
  const info = await Snapshot.get().getSpace(space)
  const vp: Record<string, number>[] = await snapshot.utils.getScores(space, info.strategies, info.network, null as any, [address])
  return vp.reduce((total, current) => {
    return total + Object.values(current).reduce((total, current) => total + (current | 0), 0)
  }, 0)
}

export async function hasRequiredVP(user: string, requiredVp: number) {
  const userVp = await getVotingPower(user, 'snapshot.dcl.eth')
  console.log('userVp', userVp)
  return userVp >= requiredVp
}
