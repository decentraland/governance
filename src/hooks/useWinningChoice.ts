import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { ProposalAttributes } from '../entities/Proposal/types'
import { VoteByAddress } from '../entities/Votes/types'
import { calculateResultWinner } from '../entities/Votes/utils'

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
  const choices = useMemo((): string[] => proposal.snapshot_proposal?.choices || [], [proposal])
  const winningChoice = useMemo(() => calculateResultWinner(choices, votes || {}), [choices, votes])

  return {
    winningChoice,
    userChoice: userVote ? choices?.[userVote.choice - 1] : null,
  }
}

export default useWinningChoice
