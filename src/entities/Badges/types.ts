export enum BadgeStatus {
  Burned = 'BURNED',
  Minted = 'MINTED',
  Reinstated = 'REINSTATED',
  Revoked = 'REVOKED',
}

export enum BadgeStatusReason {
  TenureEnded = 'tenure ended',
  Minted = 'Badge minted by user',
  BurnedByUser = 'Badge burned by user',
}

export type Badge = {
  name: string
  description: string
  image: string
  status: BadgeStatus
  createdAt: number
}

export type UserBadges = { currentBadges: Badge[]; expiredBadges: Badge[]; total: number }

export function isBadgeStatus(value: string | null | undefined): boolean {
  return !!value && new Set<string>(Object.values(BadgeStatus)).has(value)
}

export function toBadgeStatus(value: string | null | undefined): BadgeStatus {
  if (isBadgeStatus(value)) return value as BadgeStatus
  else throw new Error(`Invalid BadgeStatus ${value}`)
}
