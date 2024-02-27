import { AuthLinkType } from '@dcl/crypto/dist/types'
import type { AuthIdentity } from '@dcl/crypto/dist/types'
import * as SSO from '@dcl/single-sign-on-client'

import Time from '../../../utils/date/Time'

import { ownerAddress } from './identify'

export enum PersistedKeys {
  Identity = `org.decentraland.gatsby.identity`,
  Transactions = `org.decentraland.gatsby.transactions`,
}

const STORE_LEGACY_KEY = 'auth'
let CURRENT_IDENTITY: AuthIdentity | null = null
let CURRENT_IDENTITY_RAW: string | null = null

export function isExpired(identity?: AuthIdentity) {
  if (!identity) {
    return true
  }

  return Time.date(identity.expiration).getTime() < Date.now()
}

export function isValid(identity?: AuthIdentity) {
  if (!identity) {
    return false
  }

  const link = identity.authChain.find(
    (link) => link.type === AuthLinkType.ECDSA_PERSONAL_EPHEMERAL || link.type === AuthLinkType.ECDSA_EIP_1654_EPHEMERAL
  )

  if (link && link.signature && typeof link.signature === 'string') {
    return true
  }

  return false
}

export async function setCurrentIdentity(identity: AuthIdentity | null) {
  if (identity === null || isExpired(identity) || !isValid(identity)) {
    CURRENT_IDENTITY = null
    await storeIdentity(null)
    return null
  }

  CURRENT_IDENTITY = identity
  await storeIdentity(identity)
  return identity
}

export function getCurrentIdentity() {
  return CURRENT_IDENTITY
}

async function storeIdentity(identity: AuthIdentity | null) {
  if (typeof localStorage !== 'undefined') {
    // Removes the identity from legacy storage.
    localStorage.removeItem(STORE_LEGACY_KEY)
    localStorage.removeItem(PersistedKeys.Identity)

    if (identity) {
      // If an identity is provided, store it in the SSO iframe for the account it belongs to.
      const account = await ownerAddress(identity.authChain)
      await SSO.storeIdentity(account, identity)
      CURRENT_IDENTITY_RAW = JSON.stringify(identity)
    } else {
      CURRENT_IDENTITY_RAW = null
    }
  }
}

// Clears the identity from SSO.
export async function clearIdentity() {
  if (CURRENT_IDENTITY_RAW) {
    const prevIdentity = JSON.parse(CURRENT_IDENTITY_RAW)
    const account = await ownerAddress(prevIdentity.authChain)
    await SSO.clearIdentity(account)
  }
}
