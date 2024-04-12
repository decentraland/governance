import { useMemo } from 'react'

import { ProposalAttributes } from '../entities/Proposal/types'
import { VoteByAddress } from '../entities/Votes/types'
import { calculateResultWinner } from '../entities/Votes/utils'
import { useAuthContext } from '../front/context/AuthProvider'

import useProposalChoices from './useProposalChoices'

type WinningChoice = ReturnType<typeof calculateResultWinner>

function useWinningChoice(
  proposal: Pick<ProposalAttributes, 'id' | 'snapshot_proposal'>,
  votes?: VoteByAddress | null
): {
  winningChoice: WinningChoice
  userChoice: string | null
} {
  const [account] = useAuthContext()
  const userVote = account ? votes?.[account] : undefined
  const choices = useProposalChoices(proposal)
  const winningChoice = useMemo(() => calculateResultWinner(choices, votes || {}), [choices, votes])

  return {
    winningChoice,
    userChoice: userVote ? choices?.[userVote.choice - 1] : null,
  }
}

export default useWinningChoice
