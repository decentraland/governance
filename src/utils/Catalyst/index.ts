import fetch from 'isomorphic-fetch'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Avatar, ProfileResponse } from './types'

const CATALYST_URL = 'https://peer.decentraland.org'
const DEFAULT_AVATAR_IMAGE = 'https://decentraland.org/images/male.png'

export async function getProfile(address: string): Promise<Avatar | null> {
  if (!isEthereumAddress(address)) {
    throw new Error(`Invalid address provided. Value: ${address}`)
  }

  const response: ProfileResponse = await (await fetch(`${CATALYST_URL}/lambdas/profile/${address}`)).json()

  return response.avatars.length > 0 ? response.avatars[0] : null
}

export function createDefaultAvatar(address: string): Avatar {
  return {
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
  }
}
