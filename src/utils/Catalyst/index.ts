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

const createDefaultProfile = (address: string): CatalystProfile => ({
  userId: address,
  ethAddress: address,
  hasClaimedName: false,
  avatar: {
    snapshots: {
      face: DEFAULT_AVATAR_IMAGE,
      face128: DEFAULT_AVATAR_IMAGE,
      face256: DEFAULT_AVATAR_IMAGE,
      body: '',
    },
    bodyShape: 'dcl://base-avatars/BaseMale',
    eyes: {
      color: {
        r: 0.125,
        g: 0.703125,
        b: 0.96484375,
      },
    },
    hair: {
      color: {
        r: 0.234375,
        g: 0.12890625,
        b: 0.04296875,
      },
    },
    skin: {
      color: {
        r: 0.94921875,
        g: 0.76171875,
        b: 0.6484375,
      },
    },
    wearables: [
      'dcl://base-avatars/green_hoodie',
      'dcl://base-avatars/brown_pants',
      'dcl://base-avatars/sneakers',
      'dcl://base-avatars/casual_hair_01',
      'dcl://base-avatars/beard',
    ],
    version: 0,
  },
  name: '',
  email: '',
  description: '',
  blocked: [],
  inventory: [],
  version: 0,
  tutorialStep: 0,
  isDefaultProfile: true,
})

function getDclProfile(profile: CatalystProfile | null, address: string): DclProfile {
  const username = getUsername(profile, address)
  const hasAvatar = !!profile && !!profile.avatar
  const avatarUrl = hasAvatar ? profile.avatar.snapshots.face256 : DEFAULT_AVATAR_IMAGE

  if (!profile) {
    return {
      ...createDefaultProfile(address),
      username,
      avatarUrl,
      hasCustomAvatar: hasAvatar,
      address: address.toLowerCase(),
    }
  }

  return { ...profile, username, avatarUrl, hasCustomAvatar: hasAvatar, address: address.toLowerCase() }
}

export async function getProfile(address: string): Promise<DclProfile> {
  if (!address || !isEthereumAddress(address)) {
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
