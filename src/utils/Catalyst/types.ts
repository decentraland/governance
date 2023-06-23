export type Avatar = {
  userId: string
  email: string | null | undefined
  name: string | null | undefined
  hasClaimedName: boolean
  description: string | null | undefined
  ethAddress: string
  version: number
  avatar: {
    bodyShape: string
    snapshots: {
      face?: string
      face128?: string
      face256?: string
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
  blocked?: string[]
  tutorialStep: number
  hasConnectedWeb3?: boolean
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
  avatars: Avatar[]
}
