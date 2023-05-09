import camelCase from 'lodash/camelCase'

import { capitalizeFirstLetter } from '../../helpers'

export enum BadgeStatus {
  Burned = 'Burned',
  Minted = 'Minted',
  Reinstated = 'Reinstated',
  Revoked = 'Revoked',
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

export function toBadgeStatus(value: string): BadgeStatus {
  if (!value || value.length === 0) throw new Error(`Invalid BadgeStatus`)
  return capitalizeFirstLetter(value.toLowerCase()) as BadgeStatus
}
