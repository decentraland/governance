export type CatalystProfile = {
  userId: string
  name: string
  description: string
  ethAddress: string
  version: number
  tutorialStep: number
  email?: string
  blocked?: string[]
  interests?: string[]
  hasClaimedName: boolean
  avatar: {
    bodyShape: string
    snapshots: {
      face: string
      face128: string
      face256: string
      body: string
    }
    eyes: Color
    hair: Color
    skin: Color
    wearables: string[]
    emotes?: { slot: number; urn: string }[]
    version?: number
  }
  inventory?: string[]
  hasConnectedWeb3?: boolean
  isDefaultProfile: boolean
}

type Color = {
  color: {
    r: number
    g: number
    b: number
    a?: number
  }
}

export type ProfileResponse = {
  avatars: CatalystProfile[]
}

export type DclProfile = {
  username: string | null
  avatarUrl: string
  hasCustomAvatar: boolean
  address: string
  description?: string
}
