import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { ProposalAttributes } from '../entities/Proposal/types'
import { Vote } from '../entities/Votes/types'
import { Scores, getProposalScores } from '../entities/Votes/utils'

export const MINIMUM_VP_REQUIRED_TO_VOTE = 1

function getDelegatedVotingPowerOnProposal(
  scoresAtProposalCreation: Scores,
  delegators: string[] | null,
  votes?: Record<string, Vote> | null
) {
  let delegatedVotingPower = 0
  if (scoresAtProposalCreation && !!delegators) {
    for (const delegator of delegators) {
      if (votes && !votes[delegator]) {
        delegatedVotingPower += scoresAtProposalCreation[delegator] || 0
      }
    }
  }
  return delegatedVotingPower
}

interface CurrentVPOnProposal {
  addressVp: number
  delegatedVp: number
}

const initialVotingPowerOnProposal: CurrentVPOnProposal = {
  addressVp: 0,
  delegatedVp: 0,
}

export default function useVotingPowerOnProposal(
  address: string | null,
  delegators: string[] | null,
  votes?: Record<string, Vote> | null,
  proposal?: ProposalAttributes | null
) {
  const [vpOnProposal, vpOnProposalState] = useAsyncMemo(
    async () => {
      if (!address || !proposal) {
        return initialVotingPowerOnProposal
      }

      const addresses = delegators ? [address, ...delegators] : [address]
      const scoresAtProposalCreation = await getProposalScores(proposal, addresses)

      const delegatedVp = getDelegatedVotingPowerOnProposal(scoresAtProposalCreation, delegators, votes)
      const addressVp = scoresAtProposalCreation[address] || 0
      return { addressVp, delegatedVp }
    },
    [address, delegators?.length, proposal?.id],
    { initialValue: initialVotingPowerOnProposal, callWithTruthyDeps: true }
  )
  const totalVpOnProposal = vpOnProposal.addressVp + vpOnProposal.delegatedVp
  const hasEnoughToVote = totalVpOnProposal > MINIMUM_VP_REQUIRED_TO_VOTE && !vpOnProposalState.loading
  return { totalVpOnProposal, ...vpOnProposal, hasEnoughToVote, vpOnProposalState }
}
