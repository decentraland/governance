import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { DetailedScores } from '../api/Snapshot'
import { ProposalAttributes } from '../entities/Proposal/types'
import { MINIMUM_VP_REQUIRED_TO_VOTE } from '../entities/Votes/constants'
import { Vote } from '../entities/Votes/types'
import { getProposalScores } from '../entities/Votes/utils'

function getDelegatedVotingPowerOnProposal(
  scoresAtProposalCreation: DetailedScores,
  delegators: string[] | null,
  votes?: Record<string, Vote> | null
) {
  let delegatedVotingPower = 0
  if (scoresAtProposalCreation && !!delegators) {
    for (const delegator of delegators) {
      if (votes && !votes[delegator]) {
        delegatedVotingPower += scoresAtProposalCreation[delegator].ownVp || 0
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
  isLoadingDelegators: boolean,
  votes?: Record<string, Vote> | null,
  proposal?: ProposalAttributes | null
) {
  const [vpOnProposal, vpOnProposalState] = useAsyncMemo(
    async () => {
      if (!address || !proposal || isLoadingDelegators) {
        return initialVotingPowerOnProposal
      }
      const addresses = delegators ? [address, ...delegators] : [address]
      const scoresAtProposalCreation: DetailedScores = await getProposalScores(proposal, addresses)

      const delegatedVp = getDelegatedVotingPowerOnProposal(scoresAtProposalCreation, delegators, votes)
      const addressVp = scoresAtProposalCreation[address].ownVp || 0
      return { addressVp, delegatedVp }
    },
    [votes, address, proposal, delegators],
    { initialValue: initialVotingPowerOnProposal }
  )
  const totalVpOnProposal = vpOnProposal.addressVp + vpOnProposal.delegatedVp
  const hasEnoughToVote = totalVpOnProposal > MINIMUM_VP_REQUIRED_TO_VOTE && !vpOnProposalState.loading
  return { totalVpOnProposal, ...vpOnProposal, hasEnoughToVote, vpOnProposalState }
}
