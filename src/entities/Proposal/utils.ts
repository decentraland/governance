import { getCatalystServersFromCache, getNameDenylistFromCache } from 'dcl-catalyst-client/dist/contracts-snapshots'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import 'isomorphic-fetch'
import numeral from 'numeral'

import { Governance } from '../../clients/Governance'
import { GOVERNANCE_API } from '../../constants'
import { getTile } from '../../utils/Land'
import Time from '../../utils/date/Time'
import { env } from '../../utils/env'
import { SNAPSHOT_SPACE, SNAPSHOT_URL } from '../Snapshot/constants'
import { DISCOURSE_API } from '../User/utils'

import { MAX_NAME_SIZE, MIN_NAME_SIZE } from './constants'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'

export const MIN_PROPOSAL_OFFSET = 0
export const MAX_PROPOSAL_LIMIT = 100
export const SITEMAP_ITEMS_PER_PAGE = 100

export const DEFAULT_CHOICES = ['yes', 'no', 'abstain']
export const REGEX_NAME = new RegExp(`^([a-zA-Z0-9]){${MIN_NAME_SIZE},${MAX_NAME_SIZE}}$`)

export const JOIN_DISCORD_URL = env('GATSBY_JOIN_DISCORD_URL') || 'https://dcl.gg/discord'

export const CLIFF_PERIOD_IN_DAYS = 29

export function formatBalance(value: number | bigint) {
  return numeral(value).format('0,0')
}

export function isValidName(name: string) {
  return REGEX_NAME.test(name)
}

export function isValidDomainName(domain: string) {
  return new RegExp('^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$').test(domain)
}

export async function isValidImage(imageUrl: string) {
  return await Governance.get().checkImage(imageUrl)
}

export function isAlreadyBannedName(name: string) {
  return !!getNameDenylistFromCache('mainnet').find((bannedName) => bannedName.toLowerCase() === name.toLowerCase())
}

export async function isAlreadyPointOfInterest(x: number, y: number) {
  const pois = await Catalyst.get().getPOIs()
  return !!pois.find((position) => position[0] === x && position[1] === y)
}

export async function isValidPointOfInterest(x: number, y: number) {
  const tile = await getTile([x, y])
  if (!tile) {
    return false
  }

  switch (tile?.type) {
    case 'road':
      return false
    default:
      return true
  }
}

export function isAlreadyACatalyst(domain: string) {
  return !!getCatalystServersFromCache('mainnet').find((server) => server.address === 'https://' + domain)
}

export function isValidUpdateProposalStatus(current: ProposalStatus, next: ProposalStatus) {
  switch (current) {
    case ProposalStatus.Finished:
      return (
        next === ProposalStatus.Rejected ||
        next === ProposalStatus.Passed ||
        next === ProposalStatus.Enacted ||
        next === ProposalStatus.OutOfBudget
      )
    case ProposalStatus.Passed:
    case ProposalStatus.Enacted:
      return next === ProposalStatus.Enacted
    default:
      return false
  }
}

export function isValidTransactionHash(transactionHash: string) {
  return /^0x([A-Fa-f\d]{64})$/.test(transactionHash)
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
  const target = new URL(DISCOURSE_API || '')
  target.pathname = `/t/${proposal.discourse_topic_slug}/${proposal.discourse_topic_id}`
  return target.toString()
}

export function forumUserUrl(username: string) {
  const target = new URL(DISCOURSE_API || '')
  target.pathname = `/u/${username}`
  return target.toString()
}

export function governanceUrl(pathname = '') {
  const target = new URL(GOVERNANCE_API)
  target.pathname = pathname
  target.search = ''
  target.hash = ''
  return target.toString()
}

export function proposalUrl(id: ProposalAttributes['id']) {
  const params = new URLSearchParams({ id })
  const target = new URL(GOVERNANCE_API)
  target.pathname = '/proposal/'
  target.search = '?' + params.toString()
  return target.toString()
}

export const EDIT_DELEGATE_SNAPSHOT_URL = snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`)

export function userModifiedForm(stateValue: Record<string, unknown>, initialState: Record<string, unknown>) {
  const isInitialState = JSON.stringify(stateValue) === JSON.stringify(initialState)
  return !isInitialState && Object.values(stateValue).some((value) => !!value)
}

export function isProposalInCliffPeriod(enactedDate: number) {
  const now = Time.utc()
  return Time.unix(enactedDate).add(CLIFF_PERIOD_IN_DAYS, 'day').isAfter(now)
}

export function isGovernanceProcessProposal(type: ProposalType) {
  return type === ProposalType.Poll || type === ProposalType.Draft || type === ProposalType.Governance
}

export function isBiddingAndTenderingProposal(type: ProposalType) {
  return type === ProposalType.Pitch || type === ProposalType.Tender || type === ProposalType.Bid
}

export function isProposalStatus(value: string | null | undefined): boolean {
  switch (value) {
    case ProposalStatus.Pending:
    case ProposalStatus.Finished:
    case ProposalStatus.Active:
    case ProposalStatus.Rejected:
    case ProposalStatus.Passed:
    case ProposalStatus.OutOfBudget:
    case ProposalStatus.Enacted:
    case ProposalStatus.Deleted:
      return true
    default:
      return false
  }
}

export function toProposalStatus(value: string | null | undefined, orElse: () => any): ProposalStatus | any {
  return isProposalStatus(value) ? (value as ProposalStatus) : orElse()
}

export function isProposalDeletable(proposalStatus?: ProposalStatus) {
  return proposalStatus === ProposalStatus.Active || proposalStatus === ProposalStatus.Pending
}

export function isProposalEnactable(proposalStatus: ProposalStatus) {
  return proposalStatus === ProposalStatus.Passed || proposalStatus === ProposalStatus.Enacted
}

export function proposalCanBePassedOrRejected(proposalStatus?: ProposalStatus) {
  return proposalStatus === ProposalStatus.Finished
}

export function canLinkProposal(status: ProposalStatus) {
  return status === ProposalStatus.Passed || status === ProposalStatus.OutOfBudget
}

export function getProposalEndDate(duration: number) {
  return Time.utc().set('seconds', 0).add(duration, 'seconds').toDate()
}

export function getProposalStatusDisplayName(proposalStatus: ProposalStatus) {
  return proposalStatus.split('_').join(' ').toUpperCase()
}

export function getProposalStatusShortName(status: ProposalStatus) {
  return status === ProposalStatus.OutOfBudget ? 'OOB' : getProposalStatusDisplayName(status)
}

export function isGrantProposalSubmitEnabled(now: number) {
  const ENABLE_START_DATE = Time.utc('2023-03-01').add(8, 'hour')
  return !Time(now).isBefore(ENABLE_START_DATE)
}

export function getProposalCategory(proposalType: ProposalType, proposalConfiguration: any): string | null {
  return proposalType === ProposalType.Grant ? proposalConfiguration.category : null
}

export function hasTenderProcessFinished(tenderProposals: ProposalAttributes[]) {
  return !!tenderProposals?.find(
    (proposal) =>
      proposal.status === ProposalStatus.Enacted ||
      proposal.status === ProposalStatus.Passed ||
      proposal.status === ProposalStatus.Rejected
  )
}

export function hasTenderProcessStarted(tenderProposals?: ProposalAttributes[]) {
  return !!tenderProposals && tenderProposals.length > 0 && Time(tenderProposals[0].start_at).isBefore(Time())
}

export function getBudget(proposal: ProposalAttributes) {
  const { type, configuration } = proposal
  switch (type) {
    case ProposalType.Grant:
      return Number(configuration.size)
    case ProposalType.Bid:
      return Number(configuration.funding)
    default:
      return null
  }
}
