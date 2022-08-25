import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { Snapshot, SnapshotProposal, SnapshotVote } from '../../api/Snapshot'

import { SNAPSHOT_SPACE } from './constants'

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
    const proposalId = vote1.proposal.id
    const vote2 = votes2.find((v) => v.proposal.id === proposalId)
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
  const values = await Promise.all([await Snapshot.get().getStatus(), await Snapshot.get().getSpace(spaceName)])
  const snapshotStatus = values[0]
  const snapshotSpace = values[1]
  if (!snapshotSpace) {
    throw new Error(`Couldn't find snapshot space ${spaceName}. 
      \nSnapshot response: ${JSON.stringify(snapshotSpace)}
      \nSnapshot status: ${JSON.stringify(snapshotStatus)}`)
  }
  return { snapshotStatus, snapshotSpace }
}
