import fetch from 'isomorphic-fetch'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { isSameAddress } from '../../entities/Snapshot/utils'

import { CatalystProfile, DclProfile, ProfileResponse } from './types'

const CATALYST_URL = 'https://peer.decentraland.org'
export const DEFAULT_AVATAR_IMAGE = 'https://decentraland.org/images/male.png'

function getUsername(profile: CatalystProfile | null, address: string) {
  const hasName = !!profile && !!profile.name && profile.name.length > 0
  if (!hasName) {
    return null
  }

  const { hasClaimedName, name } = profile

  return hasClaimedName ? name : `${name.split('#')[0]}#${address.slice(-4)}`
}

function getDclProfile(profile: CatalystProfile | null, address: string): DclProfile {
  const username = getUsername(profile, address)
  const hasAvatar = !!profile && !!profile.avatar
  const avatarUrl = hasAvatar ? profile.avatar.snapshots.face256 : DEFAULT_AVATAR_IMAGE
  return { ...profile, username, avatarUrl, hasCustomAvatar: hasAvatar, address: address.toLowerCase() }
}

export async function getProfile(address: string): Promise<DclProfile> {
  if (!isEthereumAddress(address)) {
    throw new Error(`Invalid address provided. Value: ${address}`)
  }

  const response: ProfileResponse = await (await fetch(`${CATALYST_URL}/lambdas/profile/${address}`)).json()
  const profile = response.avatars.length > 0 ? response.avatars[0] : null
  return getDclProfile(profile, address)
}

export async function getProfiles(addresses: string[]): Promise<DclProfile[]> {
  for (const address of addresses) {
    if (!isEthereumAddress(address)) {
      throw new Error(`Invalid address provided. Value: ${address}`)
    }
  }

  const response: ProfileResponse[] = await (
    await fetch(`${CATALYST_URL}/lambdas/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: addresses }),
    })
  ).json()

  const profiles: DclProfile[] = []

  for (const address of addresses) {
    const profile = response.find((profile) => isSameAddress(profile.avatars[0]?.ethAddress, address))
    profiles.push(getDclProfile(profile?.avatars[0] || null, address))
  }

  return profiles
}

export function getContentUrl(hash: string) {
  return `${CATALYST_URL}/content/contents/${hash}`
}

type ContentEntityScene = {
  content: { file: string; hash: string }[]
  metadata: {
    display?: {
      navmapThumbnail?: string // "scene-thumbnail.png" | "https://decentraland.org/images/thumbnail.png"
    }
  }
}

export async function getEntityScenes(pointers: (string | [number, number])[]): Promise<ContentEntityScene[]> {
  if (!pointers || pointers.length === 0) {
    return []
  }

  const params = pointers
    .map((point) => {
      return 'pointer=' + (Array.isArray(point) ? point.slice(0, 2).join(',') : point)
    })
    .join('&')

  return await (await fetch(`${CATALYST_URL}/content/entities/scene?` + params)).json()
}
