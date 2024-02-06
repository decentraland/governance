import { ethers } from 'ethers'

import { OtterspaceBadge } from '../../clients/OtterspaceSubgraph'
import Time from '../../utils/date/Time'

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
  ReinstatedByUser = 'Reinstated by user',
  Other = 'other',
}

export type Badge = {
  name: string
  description: string
  image: string
  status: BadgeStatus
  statusReason: BadgeStatusReason
  isPastBadge: boolean
  createdAt: number
  transactionHash: string
  owner?: string
}

export type UploadedBadgeSpec = {
  name: string
  imageName: string
}

export type GovernanceBadgeSpec = {
  name: string
  description: string
  image: string
  badges: Badge[]
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
export type GasConfig = {
  gasLimit: ethers.BigNumber
} & PolygonGasData
export type PolygonGasData = {
  maxFeePerGas: ethers.BigNumber
  maxPriorityFeePerGas: ethers.BigNumber
}
type BlockNativeEstimation = {
  confidence: number
  price: number
  maxPriorityFeePerGas: number
  maxFeePerGas: number
}
export type BlockNativeResponse = {
  system: string
  network: string
  unit: string
  maxPrice: number
  currentBlockNumber: number
  msSinceLastBlock: number
  blockPrices: [
    {
      blockNumber: number
      estimatedTransactionCount: number
      baseFeePerGas: number
      estimatedPrices: BlockNativeEstimation[]
    }
  ]
  estimatedBaseFees: never[]
}

export function isBadgeStatus(value: string | null | undefined): boolean {
  return !!value && new Set<string>(Object.values(BadgeStatus)).has(value)
}

export function isBadgeStatusReason(value: string | null | undefined): boolean {
  return !!value && new Set<string>(Object.values(BadgeStatusReason)).has(value)
}

export function toBadgeStatus(value: string | null | undefined): BadgeStatus {
  if (isBadgeStatus(value)) return value as BadgeStatus
  else throw new Error(`Invalid BadgeStatus ${value}`)
}

export function toBadgeStatusReason(value: string | null | undefined): BadgeStatusReason {
  if (isBadgeStatusReason(value)) return value as BadgeStatusReason
  else throw new Error(`Invalid BadgeStatusReason ${value}`)
}

export function isPastBadge(badge: OtterspaceBadge) {
  const status = toBadgeStatus(badge.status)
  const expiresAt = badge.spec.metadata.expiresAt
  return (
    (status === BadgeStatus.Revoked && badge.statusReason === BadgeStatusReason.TenureEnded) ||
    (!!expiresAt && expiresAt.length > 0 && Time.utc(badge.spec.metadata.expiresAt).isBefore(Time.utc()))
  )
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

export function shouldDisplayBadge(badge: Badge) {
  return (
    badge.status !== BadgeStatus.Burned &&
    !(badge.status === BadgeStatus.Revoked && badge.statusReason === BadgeStatusReason.Other) &&
    badge.name &&
    badge.name.length > 0
  )
}
