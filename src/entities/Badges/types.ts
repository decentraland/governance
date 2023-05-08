import camelCase from 'lodash/camelCase'

import { capitalizeFirstLetter } from '../../helpers'

export enum BadgeStatus {
  BURNED = 'Burned',
  MINTED = 'Minted',
  REINSTATED = 'Reinstated',
  REVOKED = 'Revoked',
}

export enum BadgeStatusReason {
  TENURE_ENDED = 'tenure ended',
  MINTED = 'Badge minted by user',
  BURNED_BY_USER = 'Badge burned by user',
}

export type Badge = {
  name: string
  description: string
  image: string
  status: BadgeStatus
  createdAt: number
}

export type UserBadges = { currentBadges: Badge[]; expiredBadges: Badge[]; total: number }

export const NULL_USER_BADGES: UserBadges = { currentBadges: [], expiredBadges: [], total: 0 }

export function toBadgeStatus(value: string): BadgeStatus {
  if (!value || value.length === 0) throw new Error(`Invalid BadgeStatus`)
  return capitalizeFirstLetter(value.toLowerCase()) as BadgeStatus
}
