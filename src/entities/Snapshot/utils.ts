import { Wallet } from '@ethersproject/wallet'

import { SnapshotVote } from '../../api/Snapshot'

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
