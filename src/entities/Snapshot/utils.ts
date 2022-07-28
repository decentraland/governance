import { Wallet } from '@ethersproject/wallet'

import { SnapshotProposal, SnapshotVote } from '../../api/Snapshot'

export type Match = {
  proposal_id: string
  sameVote: boolean
}

export interface MatchResult {
  percentage: number
  voteDifference: number
  matches: Match[]
}

export async function signMessage(wallet: Wallet, msg: string) {
  return wallet.signMessage(Buffer.from(msg, 'utf8'))
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

  array.sort((a, b) => a - b)
  const half = Math.floor(array.length / 2)

  if (array.length % 2) {
    return array[half]
  }

  return (array[half - 1] + array[half]) / 2.0
}

export function groupProposalsByMonth(proposals: Partial<SnapshotProposal>[], field: keyof SnapshotProposal) {
  const data: Record<string, number[]> = {}

  for (const proposal of proposals) {
    if (!proposal.created) {
      throw new Error('Proposal has no creation date')
    }
    const proposalDate = new Date(proposal.created * 1000)
    const month = proposalDate.getMonth()
    const year = proposalDate.getFullYear()
    const key = `${year}/${month + 1}`
    const value = proposal[field]

    if (typeof value !== 'number') {
      throw new Error(`Proposal field is not a number: ${value}`)
    }

    data[key] = [...(data[key] || []), value]
  }

  return data
}
