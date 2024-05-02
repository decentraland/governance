import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { DEFAULT_CHAIN_ID } from '../constants'
import logger from '../utils/logger'

export function inBackground(fun: () => Promise<unknown>) {
  Promise.resolve()
    .then(fun)
    .then((result) => logger.log('Completed background task', { result: JSON.stringify(result) }))
    .catch((err) => logger.error('Error running background task', formatError(err)))
}

export function formatError(err: Error) {
  const errorObj = {
    ...err,
    message: err.message,
    stack: err.stack,
  }

  return process.env.NODE_ENV !== 'production' ? err : errorObj
}

// Budget service
export function getUncappedRoundedPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value * 100) / total)
}

export function addressShortener(address: string) {
  if (!isEthereumAddress(address)) {
    return address
  }
  return address.substring(0, 6) + '...' + address.substring(38, 42)
}

export function getSupportedChainIds(): ChainId[] {
  return (DEFAULT_CHAIN_ID || '')
    .split(',')
    .filter(Boolean)
    .map((chainId) => Number(chainId))
}

export function getEnvironmentChainId() {
  const chainId = getSupportedChainIds()[0]
  switch (chainId) {
    case ChainId.ETHEREUM_MAINNET.valueOf():
      return ChainId.ETHEREUM_MAINNET
    case ChainId.ETHEREUM_SEPOLIA:
      return ChainId.ETHEREUM_SEPOLIA
    default:
      throw new Error(`GATSBY_DEFAULT_CHAIN_ID is not a supported network: ${chainId}`)
  }
}

export function getEnumDisplayName<T extends { [key: string]: string | number }>(anyEnum: keyof T & string): string {
  if (!anyEnum) {
    return 'undefined'
  }
  return anyEnum.split('_').join(' ').toUpperCase()
}
