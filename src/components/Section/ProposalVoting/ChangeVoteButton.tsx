import React, { useCallback } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Vote } from '../../../entities/Votes/types'

interface ChangeVoteButtonProps {
  vote: Vote | null
  delegateVote: Vote | null
  hasDelegators: boolean
  started: boolean
  finished: boolean
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<unknown, MouseEvent>, changing: boolean) => void
}

export function ChangeVoteButton({
  vote,
  delegateVote,
  hasDelegators,
  started,
  finished,
  changingVote,
  onChangeVote,
}: ChangeVoteButtonProps) {
  const t = useFormatMessage()
  const isVotingOpen = started && !finished
  const showChangeVoteButton = isVotingOpen && !changingVote && vote
  const showOverruleVoteButton = isVotingOpen && !changingVote && !vote && delegateVote && !hasDelegators
  const showCancelChangeVoteButton = isVotingOpen && (vote || delegateVote) && changingVote

  const changeVote = useCallback(
    (e: React.MouseEvent<unknown, MouseEvent>) => {
      e.preventDefault()
      onChangeVote && onChangeVote(e, true)
    },
    [onChangeVote]
  )

  const cancel = useCallback(
    (e: React.MouseEvent<unknown, MouseEvent>) => {
      e.preventDefault()
      onChangeVote && onChangeVote(e, false)
    },
    [onChangeVote]
  )

  return (
    <>
      {showChangeVoteButton && (
        <Button className={'VotingSectionFooter__Button'} as={Link} basic onClick={changeVote}>
          {t('page.proposal_detail.vote_change')}
        </Button>
      )}
      {showOverruleVoteButton && (
        <Button className={'VotingSectionFooter__Button'} as={Link} basic onClick={changeVote}>
          {t('page.proposal_detail.vote_overrule')}
        </Button>
      )}
      {showCancelChangeVoteButton && (
        <Button basic className={'VotingSectionFooter__Button'} onClick={cancel}>
          {t('general.cancel')}
        </Button>
      )}
    </>
  )
}
