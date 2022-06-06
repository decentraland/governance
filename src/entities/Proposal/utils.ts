import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import Land from 'decentraland-gatsby/dist/utils/api/Land'
import numeral from 'numeral'

import { SNAPSHOT_DURATION, SNAPSHOT_SPACE, SNAPSHOT_URL } from '../Snapshot/constants'

import { MAX_NAME_SIZE, MIN_NAME_SIZE } from './constants'
import {
  ProposalAttributes,
  ProposalGrantTier,
  ProposalGrantTierValues,
  ProposalStatus,
  toProposalGrantTier,
} from './types'

export const MIN_PROPOSAL_OFFSET = 0
export const MIN_PROPOSAL_LIMIT = 0
export const MAX_PROPOSAL_LIMIT = 100
export const SITEMAP_ITEMS_PER_PAGE = 100

export const DEFAULT_CHOICES = ['yes', 'no']
export const REGEX_NAME = new RegExp(`^([a-zA-Z0-9]){${MIN_NAME_SIZE},${MAX_NAME_SIZE}}$`)

export const JOIN_DISCORD_URL = process.env.GATSBY_JOIN_DISCORD_URL || 'https://dcl.gg/discord'

export function formatBalance(value: number | bigint) {
  return numeral(value).format('0,0')
}

export function isValidName(name: string) {
  return REGEX_NAME.test(name)
}

export function isValidDomainName(domain: string) {
  return new RegExp('^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$').test(domain)
}

export async function isAlreadyBannedName(name: string) {
  const names = await Catalyst.get().getBanNames()
  return names.includes(name.toLowerCase())
}

export async function isAlreadyPointOfInterest(x: number, y: number) {
  const pois = await Catalyst.get().getPOIs()
  return !!pois.find((position) => position[0] === x && position[1] === y)
}

export async function isValidPointOfInterest(x: number, y: number) {
  const tile = await Land.get().getTile([x, y])
  if (!tile) {
    return false
  }

  switch (tile?.type) {
    case 'road':
    case 'plaza':
      return false
    default:
      return true
  }
}

export async function isAlreadyACatalyst(domain: string) {
  const servers = await Catalyst.get().getServers()
  return !!servers.find((server) => server.baseUrl === 'https://' + domain)
}

export function isGrantSizeValid(tier: string | null, size: string | number): boolean {
  const tierIndex = Object.values(ProposalGrantTier).indexOf(toProposalGrantTier(tier)!)
  const values = Object.values(ProposalGrantTierValues)

  if (tierIndex < 0 || tierIndex >= values.length) {
    return false
  }

  const sizeNumber = asNumber(size)
  const upperTierLimit = values[tierIndex]
  const lowerTierLimit = tierIndex === 0 ? asNumber(process.env.GATSBY_GRANT_SIZE_MINIMUM || 0) : values[tierIndex - 1]

  return sizeNumber > lowerTierLimit && sizeNumber <= upperTierLimit
}

export function isValidUpdateProposalStatus(current: ProposalStatus, next: ProposalStatus) {
  switch (current) {
    case ProposalStatus.Finished:
      return next === ProposalStatus.Rejected || next === ProposalStatus.Passed || next === ProposalStatus.Enacted
    case ProposalStatus.Passed:
      return next === ProposalStatus.Enacted
    default:
      return false
  }
}

export function asNumber(value: string | number): number {
  switch (typeof value) {
    case 'number':
      return value
    case 'string':
      return value === '' ? NaN : Number(value)
    default:
      return NaN
  }
}

export function snapshotUrl(hash: string) {
  const target = new URL(SNAPSHOT_URL)
  target.pathname = ''
  target.hash = hash
  return target.toString()
}

export function snapshotProposalUrl(proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>) {
  return snapshotUrl(`#/${proposal.snapshot_space}/proposal/${proposal.snapshot_id}`)
}

export function forumUrl(proposal: Pick<ProposalAttributes, 'discourse_topic_id' | 'discourse_topic_slug'>) {
  const target = new URL(process.env.GATSBY_DISCOURSE_API || '')
  target.pathname = `/t/${proposal.discourse_topic_slug}/${proposal.discourse_topic_id}`
  return target.toString()
}

export function governanceUrl(pathname = '') {
  const target = new URL(process.env.GATSBY_GOVERNANCE_API || '')
  target.pathname = pathname
  target.search = ''
  target.hash = ''
  return target.toString()
}

export function proposalUrl(proposal: Pick<ProposalAttributes, 'id'>) {
  const params = new URLSearchParams({ id: proposal.id })
  const target = new URL(process.env.GATSBY_GOVERNANCE_API || '')
  target.pathname = '/proposal/'
  target.search = '?' + params.toString()
  return target.toString()
}

export function getUpdateUrl(updateId: string, proposalId: string) {
  const params = new URLSearchParams({ id: updateId, proposalId })
  const target = new URL(process.env.GATSBY_GOVERNANCE_API || '')
  target.pathname = '/update/'
  target.search = '?' + params.toString()
  return target.toString()
}

function grantDuration(value: string | undefined | null) {
  return Number(value || SNAPSHOT_DURATION)
}

export const GrantDuration = {
  [ProposalGrantTier.Tier1]: grantDuration(process.env.GATSBY_DURATION_GRANT_TIER1),
  [ProposalGrantTier.Tier2]: grantDuration(process.env.GATSBY_DURATION_GRANT_TIER2),
  [ProposalGrantTier.Tier3]: grantDuration(process.env.GATSBY_DURATION_GRANT_TIER3),
  [ProposalGrantTier.Tier4]: grantDuration(process.env.GATSBY_DURATION_GRANT_TIER4),
  [ProposalGrantTier.Tier5]: grantDuration(process.env.GATSBY_DURATION_GRANT_TIER5),
  [ProposalGrantTier.Tier6]: grantDuration(process.env.GATSBY_DURATION_GRANT_TIER6),
}

export const EDIT_DELEGATE_SNAPSHOT_URL = snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`)
