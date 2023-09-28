import { clientEnv } from './clientEnv'

export const NotificationType = {
  BROADCAST: 1,
  TARGET: 3,
  SUBSET: 4,
}

export function getCaipAddress(address: string, chainId: number) {
  return `eip155:${chainId}:${address}`
}

export const PUSH_CHANNEL_ID = process.env.GATSBY_PUSH_CHANNEL_ID || clientEnv('GATSBY_PUSH_CHANNEL_ID')
