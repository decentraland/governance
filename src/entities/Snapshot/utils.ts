import { Wallet } from '@ethersproject/wallet';
import { intersection } from 'lodash';
import { SnapshotVote } from '../../api/Snapshot';

export interface MatchResult {
  percentage: number,
  matches: { proposal_id: string, sameVote: boolean }[]
}

export async function signMessage(wallet: Wallet, msg: string) {
  return wallet.signMessage(Buffer.from(msg, 'utf8'));
}

export function calculateMatch(votes1: SnapshotVote[], votes2: SnapshotVote[]): MatchResult {

  const match: MatchResult = { percentage: 0, matches: [] }
  const commonProposalIds = intersection(votes1.map(vote => vote.proposal.id), votes2.map(vote => vote.proposal.id))

  if (commonProposalIds.length !== 0) {

    let matchCounter = 0
    for (const proposalId of commonProposalIds) {
      const vote1 = votes1.find(v => v.proposal.id === proposalId)!
      const vote2 = votes2.find(v => v.proposal.id === proposalId)!

      if (vote1.choice === vote2.choice) {
        matchCounter++
        match.matches.push({ proposal_id: proposalId, sameVote: true })
      }
      else {
        match.matches.push({ proposal_id: proposalId, sameVote: false })
      }
    }

    match.percentage = Math.round(matchCounter / commonProposalIds.length * 100)
  }

  return match
}
