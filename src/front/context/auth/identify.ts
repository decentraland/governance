import type { AuthChain, AuthIdentity } from '@dcl/crypto/dist/types'
import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
// import { Buffer } from 'buffer'
import type { ConnectionResponse } from 'decentraland-connect'
import { once } from 'lodash'

class EmptyAccountsError extends Error {
  code = 'EMPTY_ACCOUNTS_ERROR'
  constructor(message = 'Could not get address') {
    super(message)
  }
}

const authenticator = once(() => import('@dcl/crypto/dist/Authenticator'))

export default async function identify(connection: ConnectionResponse) {
  try {
    if (!connection.account) {
      throw new EmptyAccountsError()
    }

    const { Authenticator } = await authenticator()
    const address = connection.account!
    const provider = connection.provider
    const wallet = Wallet.createRandom()
    const expiration = 60 * 24 * 30
    const payload = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
    }

    // provider.
    const identity = await Authenticator.initializeAuthChain(address, payload, expiration, (message) =>
      new Web3Provider(provider).getSigner().signMessage(message)
    )

    return identity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err)
    return null
  }
}

export async function ownerAddress(authChain: AuthChain) {
  const { Authenticator } = await authenticator()
  return Authenticator.ownerAddress(authChain).toLowerCase()
}

export async function signPayload(identity: AuthIdentity, payload: string) {
  const { Authenticator } = await authenticator()
  return Authenticator.signPayload(identity, payload)
}
