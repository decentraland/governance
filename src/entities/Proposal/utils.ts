import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { ProposalAttributes, ProposalStatus } from './types'

export const MIN_PROPOSAL_OFFSET = 0
export const MIN_PROPOSAL_LIMIT = 0
export const MAX_PROPOSAL_LIMIT = 100

export const MIN_NAME_SIZE = 2
export const MAX_NAME_SIZE = 15
export const DEFAULT_CHOICES = [ 'yes', 'no' ]
export const REGEX_NAME = new RegExp(`^([a-zA-Z0-9]){${MIN_NAME_SIZE},${MAX_NAME_SIZE}}$`)

export function isValidName(name: string) {
  return REGEX_NAME.test(name)
}

export function isValidDomainName(domain: string) {
  return new RegExp('^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$').test(domain)
}

export async function isAlreadyBannedName(name: string) {
  const names = await Catalyst.get().getBanNames()
  return names.includes(name.toLowerCase())
}

export async function isAlreadyPointOfInterest(x: number, y: number) {
  const pois = await Catalyst.get().getPOIs()
  return !!pois.find((position) => position[0] === x && position[1] === y)
}

export async function isAlreadyACatalyst(domain: string) {
  const servers = await Catalyst.get().getServers()
  return !!servers.find(server => server.address === 'https://' + domain)
}

export function isBooleanProposal(proposal: ProposalAttributes): boolean {
  const choices = proposal.snapshot_proposal.payload.choice
  return false
}

export function calcualteProposalState(proposal: ProposalAttributes): ProposalStatus {
  const now = Date.now()
  if (
    (
      proposal.status === ProposalStatus.Passed ||
      proposal.status === ProposalStatus.Active
    ) &&
    Time.utc(proposal.finish_at).isBefore(now)
  ) {
    return ProposalStatus.Finished
  } else if (
    proposal.status === ProposalStatus.Pending &&
    Time.utc(proposal.start_at).isBefore(now)
  ) {
    return ProposalStatus.Active
  } else {
    return proposal.status
  }
}

export function asNumber(value: string | number): number {
  switch(typeof value) {
    case 'number':
      return value
    case 'string':
      return value === '' ? NaN : Number(value)
    default:
      return NaN
  }
}

export function snapshotUrl(proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>) {
  const target = new URL(process.env.GATSBY_SNAPSHOT_URL || '')
  target.pathname = ''
  target.hash = `#/${proposal.snapshot_space}/proposal/${proposal.snapshot_id}`
  return target.toString()
}

export function forumUrl(proposal: Pick<ProposalAttributes, 'discourse_topic_id' | 'discourse_topic_slug'>) {
  const target = new URL(process.env.GATSBY_DISCOURSE_API || '')
  target.pathname = `/t/${proposal.discourse_topic_slug}/${proposal.discourse_topic_id}`
  return target.toString()
}

export function proposalUrl(proposal: Pick<ProposalAttributes, 'id'>) {
  const params = new URLSearchParams({ id: proposal.id })
  const target = new URL(process.env.GATSBY_GOVERNANCE_API || '')
  // /en/proposal?id=e3d51e50-b3f0-11eb-87d1-2b8a70271dd7
  target.pathname = `/en/proposal/`
  target.search = '?' + params.toString()
  return target.toString()
}
