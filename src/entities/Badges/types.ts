import { ethers } from 'ethers'

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

export enum ErrorReason {
  NoUserWithoutBadge = 'All recipients already have this badge',
  NoUserHasVoted = 'Recipients have never voted',
  InvalidBadgeId = 'Invalid badge ID',
}

export type UserBadges = { currentBadges: Badge[]; expiredBadges: Badge[]; total: number }

export enum OtterspaceRevokeReason {
  Abuse = '0',
  LeftCommunity = '1',
  TenureEnded = '2',
  Other = '3',
}

export enum ActionStatus {
  Failed = 'Failed',
  Success = 'Success',
}

export type RevokeOrReinstateResult = { status: ActionStatus; address: string; badgeId: string; error?: string }
export type BadgeCreationResult = { status: ActionStatus; badgeCid?: string; error?: string; badgeTitle?: string }

export type GasConfig = { gasPrice: ethers.BigNumber; gasLimit: ethers.BigNumber }
export const GAS_MULTIPLIER = 2

export function isBadgeStatus(value: string | null | undefined): boolean {
  return !!value && new Set<string>(Object.values(BadgeStatus)).has(value)
}

export function toBadgeStatus(value: string | null | undefined): BadgeStatus {
  if (isBadgeStatus(value)) return value as BadgeStatus
  else throw new Error(`Invalid BadgeStatus ${value}`)
}

export function isOtterspaceRevokeReason(value: string | null | undefined): boolean {
  switch (value) {
    case OtterspaceRevokeReason.Abuse:
    case OtterspaceRevokeReason.LeftCommunity:
    case OtterspaceRevokeReason.TenureEnded:
    case OtterspaceRevokeReason.Other:
      return true
    default:
      return false
  }
}

export function toOtterspaceRevokeReason(
  value: string | null | undefined,
  orElse: (value: string | null | undefined) => never
): OtterspaceRevokeReason {
  return isOtterspaceRevokeReason(value) ? (value as OtterspaceRevokeReason) : orElse(value)
}
