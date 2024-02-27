import { useMemo } from 'react'

import { ProposalAttributes } from '../entities/Proposal/types'
import { Vote } from '../entities/Votes/types'
import { calculateResultWinner } from '../entities/Votes/utils'
import { useAuthContext } from '../front/context/AuthProvider'

type WinningChoice = ReturnType<typeof calculateResultWinner>

function useWinningChoice(
  proposal: Pick<ProposalAttributes, 'id' | 'snapshot_proposal'>,
  votes?: Record<string, Vote> | null
): {
  winningChoice: WinningChoice
  userChoice: string | null
} {
  const [account] = useAuthContext()
  const userVote = account ? votes?.[account] : undefined
  const choices = useMemo((): string[] => proposal.snapshot_proposal?.choices || [], [proposal])
  const winningChoice = useMemo(() => calculateResultWinner(choices, votes || {}), [choices, votes])

  return {
    winningChoice,
    userChoice: userVote ? choices?.[userVote.choice - 1] : null,
  }
}

export default useWinningChoice
