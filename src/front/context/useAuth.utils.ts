import type { AuthIdentity } from '@dcl/crypto/dist/types'
import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import * as SSO from '@dcl/single-sign-on-client'
import { Provider, connection } from 'decentraland-connect'
import { getChainConfiguration } from 'decentraland-dapps/dist/lib/chainConfiguration'
import { AddEthereumChainParameters } from 'decentraland-dapps/dist/modules/wallet/types'

import { ErrorClient } from '../../clients/ErrorClient'

import identify from './auth/identify'
import { setCurrentIdentity } from './auth/storage'

export const chains = [
  ChainId.ETHEREUM_MAINNET,
  ChainId.ETHEREUM_ROPSTEN,
  ChainId.ETHEREUM_GOERLI,
  ChainId.ETHEREUM_KOVAN,
  ChainId.ETHEREUM_RINKEBY,
  ChainId.ETHEREUM_SEPOLIA,
  ChainId.MATIC_MAINNET,
  ChainId.MATIC_MUMBAI,
]

export enum AuthEvent {
  Connect = 'Connect',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
}

export enum AuthStatus {
  Restoring,
  Disconnected,
  Connected,
  Connecting,
  Disconnecting,
}

export type AuthState = {
  selecting: boolean
  account: string | null
  identity: AuthIdentity | null
  provider: Provider | null
  providerType: ProviderType | null
  chainId: ChainId | null
  error: string | null
  status: AuthStatus
}

export const initialState: AuthState = Object.freeze({
  selecting: false,
  account: null,
  identity: null,
  provider: null,
  providerType: null,
  chainId: null,
  error: null,
  status: AuthStatus.Restoring,
})

export async function fetchAccounts(provider: Provider) {
  const currentAccounts = (await provider.request({
    method: 'eth_accounts',
  })) as string[]
  if (currentAccounts.length === 0) {
    throw new Error(`Provider is not connected`)
  }

  return currentAccounts.map((account) => account.toLowerCase())
}

export async function fetchChainId(provider: Provider) {
  const currentChainId = (await provider.request({
    method: 'eth_chainId',
  })) as string
  return parseInt(currentChainId, 16)
}

export async function restoreConnection(): Promise<AuthState> {
  try {
    const connectionData = connection.getConnectionData()

    if (connectionData) {
      const { providerType, chainId } = connectionData
      const data = await connection.connect(providerType, chainId)
      const provider = data.provider

      if (!provider) {
        throw new Error(`Error getting provider`)
      }

      const currentAccounts = await fetchAccounts(provider)
      const account = currentAccounts[0]
      // Get the identity first from the local storage. If it doesn't exist, get it from the iframe.
      const identity = SSO.localStorageGetIdentity(account) ?? (await SSO.getIdentity(account))

      if (identity) {
        const currentChainId = await fetchChainId(provider)
        await setCurrentIdentity(identity)

        return {
          account,
          provider,
          chainId: Number(currentChainId),
          providerType,
          identity,
          status: AuthStatus.Connected,
          selecting: false,
          error: null,
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err)
    ErrorClient.report('Error restoring connection', err)

    return {
      ...initialState,
      status: AuthStatus.Disconnected,
      error: err.message,
    }
  }

  return { ...initialState, status: AuthStatus.Disconnected }
}

export async function createConnection(providerType: ProviderType, chainId: ChainId) {
  try {
    const data = await connection.connect(providerType, chainId)
    const provider = data.provider

    if (!provider) {
      throw new Error(`Error getting provider`)
    }

    const currentAccounts = await fetchAccounts(provider)
    const account = currentAccounts[0]
    const identity = (await SSO.getIdentity(account)) ?? (await identify(data))

    if (identity) {
      const currentChainId = await fetchChainId(provider)
      await setCurrentIdentity(identity)

      return {
        account,
        provider,
        chainId: Number(currentChainId),
        providerType,
        identity,
        status: AuthStatus.Connected,
        selecting: false,
        error: null,
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err)
    ErrorClient.report('Error creating connection', err)

    await setCurrentIdentity(null)
    return {
      ...initialState,
      status: AuthStatus.Disconnected,
      error: err.message,
    }
  }

  return { ...initialState, status: AuthStatus.Disconnected }
}

export function isLoading(status: AuthStatus) {
  switch (status) {
    case AuthStatus.Connected:
    case AuthStatus.Disconnected:
      return false

    default:
      return true
  }
}

export async function switchToChainId(provider: Provider | null, chainId: ChainId) {
  if (provider) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }],
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [getAddEthereumChainParameters(chainId)],
          })

          const currentChainId = await fetchChainId(provider)
          if (currentChainId !== chainId) {
            throw new Error('chainId did not change after adding network')
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (addError: any) {
          throw new Error(`Error adding network: ${addError.message}`)
        }
      } else {
        throw new Error(`Error switching network: ${switchError.message}`)
      }
    }
  }
}

export function getAddEthereumChainParameters(chainId: ChainId): AddEthereumChainParameters {
  const hexChainId = '0x' + chainId.toString(16)
  const chainName = getChainName(chainId)!
  const config = getChainConfiguration(chainId)
  switch (chainId) {
    case ChainId.MATIC_MAINNET:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
        blockExplorerUrls: ['https://polygonscan.com/'],
      }
    case ChainId.MATIC_MUMBAI:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
      }
    case ChainId.ETHEREUM_MAINNET:
    case ChainId.ETHEREUM_ROPSTEN:
    case ChainId.ETHEREUM_RINKEBY:
    case ChainId.ETHEREUM_KOVAN:
    case ChainId.ETHEREUM_GOERLI:
    case ChainId.ETHEREUM_SEPOLIA:
    default:
      return {
        chainId: hexChainId,
        chainName,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [config.rpcURL],
        blockExplorerUrls: ['https://etherscan.io'],
      }
  }
}
