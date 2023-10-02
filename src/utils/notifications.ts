import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

import { ENV } from '../shared/types/notifications'

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

export function getPushNotificationsEnv(chainId: ChainId) {
  switch (chainId) {
    case ChainId.ETHEREUM_MAINNET:
      return ENV.PROD
    case ChainId.ETHEREUM_GOERLI:
    default:
      return ENV.STAGING
  }
}
