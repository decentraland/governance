import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { calculateWinnerChoice, getScoresResult } from '../entities/Proposal/outcomeUtils'
import { ProposalAttributes } from '../entities/Proposal/types'

import { FIVE_MINUTES_MS } from './constants'

const useProposalOutcome = (snapshotId: ProposalAttributes['snapshot_id'], choices: string[]) => {
  const { data: scores, isLoading } = useQuery({
    queryKey: [`proposalScores#${snapshotId}`],
    queryFn: async () => Governance.get().getProposalScores(snapshotId),
    staleTime: FIVE_MINUTES_MS,
    enabled: !!snapshotId && !!choices,
  })

  const scoresResult = getScoresResult(scores || [], choices)
  const winnerChoice = scores ? calculateWinnerChoice(scoresResult) : null

  return { winnerVotingPower: winnerChoice?.winnerVotingPower, isLoadingOutcome: isLoading }
}

export default useProposalOutcome
