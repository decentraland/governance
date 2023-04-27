import { BadgeStatus } from '../../clients/OtterspaceSubgraph'

export type Badge = {
  name: string
  description: string
  image: string
  status: BadgeStatus
}

export function isBadgeStatus(value: string | null | undefined): boolean {
  return !!value && new Set<string>(Object.values(BadgeStatus)).has(value)
}

export function toBadgeStatus(value: string | null | undefined, orElse: () => any): BadgeStatus | any {
  return isBadgeStatus(value) ? (value as BadgeStatus) : orElse()
}
