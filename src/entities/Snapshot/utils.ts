import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { ethers } from 'ethers'

import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import {
  Delegation,
  DelegationResult,
  EMPTY_DELEGATION,
  SnapshotProposal,
  SnapshotVote,
} from '../../clients/SnapshotGraphqlTypes'
import { SnapshotSubgraph } from '../../clients/SnapshotSubgraph'

import { SNAPSHOT_SPACE } from './constants'
import { DELEGATIONS_ON_PROPOSAL_QUERY, LATEST_DELEGATIONS_QUERY } from './queries'

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

export type OutcomeMatch = {
  outcomeMatch: number
  totalProposals: number
}

export function outcomeMatch(votes: SnapshotVote[]): OutcomeMatch {
  let matchCounter = 0
  let closedProposalsCounter = 0
  for (const vote of votes) {
    if (vote.proposal?.state === 'closed' && vote.proposal?.scores && vote.proposal?.scores.length > 0) {
      closedProposalsCounter++
      const scores = vote.proposal.scores
      const winnerChoiceScore = Math.max(...scores)
      const winnerChoiceIndex = scores.indexOf(winnerChoiceScore)
      const resultIsNotATie = scores.filter((score) => score === winnerChoiceScore).length === 1
      if (resultIsNotATie) {
        if (vote.choice === winnerChoiceIndex + 1) {
          matchCounter++
        }
      }
    }
  }
  console.log('matchCounter', matchCounter)
  console.log('closedProposalsCounter', closedProposalsCounter)
  const outcomeMatch = Math.floor((matchCounter * 100) / closedProposalsCounter) || 0
  return { outcomeMatch: outcomeMatch, totalProposals: closedProposalsCounter }
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

  const unique_delegations = new Map<string, Delegation>()

  for (const deleg of delegations) {
    if (unique_delegations.has(deleg.delegator)) {
      if (unique_delegations.get(deleg.delegator)?.space !== space) {
        unique_delegations.set(deleg.delegator, deleg)
      }
    } else {
      unique_delegations.set(deleg.delegator, deleg)
    }
  }

  return Array.from(unique_delegations.values())
}

function getFetchDelegatesVariables(address: string, blockNumber: string | number) {
  const variables: any = {
    address: address.toLowerCase(),
    space: SNAPSHOT_SPACE,
  }
  if (blockNumber) {
    variables.blockNumber = blockNumber
  }
  return variables
}

async function getDelegations(
  query: string,
  address: string | null | undefined,
  blockNumber?: string | number
): Promise<DelegationResult> {
  if (!SNAPSHOT_SPACE || !address) {
    return EMPTY_DELEGATION
  }
  const variables = getFetchDelegatesVariables(address, blockNumber || 'latest')
  try {
    const delegates = await SnapshotSubgraph.get().fetchDelegates(query, variables)
    if (!delegates) {
      return EMPTY_DELEGATION
    }
    const filteredDelegatedFrom = filterDelegationFrom(delegates.delegatedFrom, SNAPSHOT_SPACE)
    return {
      delegatedTo: filterDelegationTo(delegates.delegatedTo, SNAPSHOT_SPACE),
      delegatedFrom: filteredDelegatedFrom.slice(0, 99),
      hasMoreDelegatedFrom: filteredDelegatedFrom.length > 99,
    }
  } catch (error) {
    console.error(error)
    return EMPTY_DELEGATION
  }
}

export async function getDelegationsOnProposal(address?: string | null, blockNumber?: string | number) {
  return await getDelegations(DELEGATIONS_ON_PROPOSAL_QUERY, address, blockNumber)
}

export async function getLatestDelegations(address: string | null | undefined) {
  return await getDelegations(LATEST_DELEGATIONS_QUERY, address)
}

export function getChecksumAddress(address: string) {
  return ethers.utils.getAddress(address.toLowerCase())
}
