import { BadgeStatus } from '../../clients/OtterspaceSubgraph'

export type Badge = {
  name: string
  description: string
  image: string
  status: BadgeStatus
  createdAt: number
}

export type UserBadges = { currentBadges: Badge[]; expiredBadges: Badge[]; total: number }

export const NULL_USER_BADGES: UserBadges = { currentBadges: [], expiredBadges: [], total: 0 }

export function isBadgeStatus(value: string | null | undefined): boolean {
  return !!value && new Set<string>(Object.values(BadgeStatus)).has(value)
}

export function toBadgeStatus(value: string | null | undefined, orElse: () => any): BadgeStatus | any {
  return isBadgeStatus(value) ? (value as BadgeStatus) : orElse()
}
