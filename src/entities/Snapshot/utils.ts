import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { ethers } from 'ethers'

import {
  Delegation,
  DelegationResult,
  EMPTY_DELEGATION,
  SnapshotGraphql,
  SnapshotProposal,
  SnapshotVote,
} from '../../clients/SnapshotGraphql'
import { SnapshotSubgraph } from '../../clients/SnapshotSubgraph'

import { SNAPSHOT_SPACE } from './constants'
import { getDelegatedQuery } from './queries'

export type Match = {
  proposal_id: string
  sameVote: boolean
}

export interface MatchResult {
  percentage: number
  voteDifference: number
  matches: Match[]
}

export function calculateMatch(votes1: SnapshotVote[] | null, votes2: SnapshotVote[] | null): MatchResult {
  const match: MatchResult = { percentage: 0, voteDifference: 0, matches: [] }

  if (!votes1 || !votes2) return match

  let matchCounter = 0
  let voteDifference = 0
  let proposalsInCommon = 0
  for (const vote1 of votes1) {
    const proposalId = vote1.proposal!.id
    const vote2 = votes2.find((v) => v.proposal!.id === proposalId)
    if (vote2) {
      proposalsInCommon++
      if (vote1.choice === vote2.choice) {
        matchCounter++
        match.matches.push({ proposal_id: proposalId, sameVote: true })
      } else {
        voteDifference++
        match.matches.push({ proposal_id: proposalId, sameVote: false })
      }
    }
  }
  if (proposalsInCommon > 0) {
    match.percentage = Math.round((matchCounter / proposalsInCommon) * 100)
    match.voteDifference = voteDifference
  }
  return match
}

export function median(array: number[]) {
  if (array.length === 0) throw new Error('Median: no inputs')

  const sortedArray = [...array].sort((a, b) => a - b)
  const half = Math.floor(sortedArray.length / 2)

  if (sortedArray.length % 2) {
    return sortedArray[half]
  }

  return (sortedArray[half - 1] + sortedArray[half]) / 2.0
}

function parseYearMonth(proposalDate: Date) {
  const month = ('0' + (proposalDate.getMonth() + 1)).slice(-2)
  const year = proposalDate.getFullYear()
  return `${year}/${month}`
}

export function groupProposalsByMonth(proposals: Partial<SnapshotProposal>[], field: keyof SnapshotProposal) {
  const ERROR_KEY = 'groupProposalsByMonth'
  const data: Record<string, number[]> = {}

  for (const proposal of proposals) {
    if (proposal.created) {
      const proposalDate = new Date(proposal.created * 1000)
      const key = parseYearMonth(proposalDate)
      const value = proposal[field]
      if (typeof value === 'number') {
        data[key] = [...(data[key] || []), value]
      } else {
        logger.error(`${ERROR_KEY}: proposal field '${field}' is not a number`, { proposal, value })
      }
    } else {
      logger.error(`${ERROR_KEY}: proposal has no creation date`, { proposal })
    }
  }

  return data
}

export async function getSnapshotStatusAndSpace(spaceName?: string) {
  spaceName = spaceName && spaceName.length > 0 ? spaceName : SNAPSHOT_SPACE
  const values = await Promise.all([
    await SnapshotGraphql.get().getStatus(),
    await SnapshotGraphql.get().getSpace(spaceName),
  ])
  const snapshotStatus = values[0]
  const snapshotSpace = values[1]
  if (!snapshotSpace) {
    throw new Error(`Couldn't find snapshot space ${spaceName}. 
      \nSnapshot response: ${JSON.stringify(snapshotSpace)}
      \nSnapshot status: ${JSON.stringify(snapshotStatus)}`)
  }
  return { snapshotStatus, snapshotSpace }
}

export function filterDelegationTo(delegations: Delegation[], space: string): Delegation[] {
  if (delegations.length > 1) {
    return delegations.filter((delegation) => delegation.space === space)
  }

  return delegations
}

export function filterDelegationFrom(delegations: Delegation[], space: string): Delegation[] {
  if (delegations.length === 0) {
    return []
  }

  const uniqueDelegations = new Map<string, Delegation>()

  for (const deleg of delegations) {
    if (uniqueDelegations.has(deleg.delegator)) {
      if (uniqueDelegations.get(deleg.delegator)?.space !== space) {
        uniqueDelegations.set(deleg.delegator, deleg)
      }
    } else {
      uniqueDelegations.set(deleg.delegator, deleg)
    }
  }

  return Array.from(uniqueDelegations.values())
}

function getDelegatesVariables(address: string, blockNumber?: string | number) {
  return {
    address: address.toLowerCase(),
    space: SNAPSHOT_SPACE,
    ...(!!blockNumber && { blockNumber }),
  }
}

export async function getDelegations(
  address: string | null | undefined,
  blockNumber?: string | number
): Promise<DelegationResult> {
  if (!SNAPSHOT_SPACE || !address) {
    return EMPTY_DELEGATION
  }
  const variables = getDelegatesVariables(address, blockNumber)
  try {
    const delegatedTo = await SnapshotSubgraph.get().getDelegates(
      'delegatedTo',
      getDelegatedQuery('delegatedTo', blockNumber),
      variables
    )
    const delegatedFrom = await SnapshotSubgraph.get().getDelegates(
      'delegatedFrom',
      getDelegatedQuery('delegatedFrom', blockNumber),
      variables
    )

    if (!delegatedTo && !delegatedFrom) {
      return EMPTY_DELEGATION
    }

    return {
      delegatedTo: filterDelegationTo(delegatedTo, SNAPSHOT_SPACE),
      delegatedFrom: filterDelegationFrom(delegatedFrom, SNAPSHOT_SPACE),
    }
  } catch (error) {
    console.error(error)
    return EMPTY_DELEGATION
  }
}

export function getChecksumAddress(address: string) {
  return ethers.utils.getAddress(address.toLowerCase())
}
