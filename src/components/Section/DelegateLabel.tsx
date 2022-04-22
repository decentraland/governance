import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { intersection } from 'lodash'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Vote } from '../../entities/Votes/types'
import Username from '../User/Username'
import { Delegation } from '../../hooks/useDelegation'
import './DelegateLabel.css'

const useDelegateLabel = (
  vote: Vote | null,
  votes?: Record<string, Vote> | null,
  delegateVote?: Vote,
  delegate?: string,
  delegators?: Delegation[]
): string => {
  const t = useFormatMessage()

  if (delegators) {
    const votesAddresses = Object.keys(votes || {})
    const delegatorsAddresses = delegators.map((i) => i.delegator) || []
    const delegatorsVotes = intersection(votesAddresses, delegatorsAddresses).length
    const totalDelegators = delegators.length
    const delegatorsWithoutVotes = totalDelegators - delegatorsVotes

    if (delegate && !vote && !delegateVote) {
      return t('page.proposal_detail.delegators_with_delegate_no_votes', { delegate, total: totalDelegators })
    }

    if (!delegate && !vote && delegatorsVotes > 0) {
      return t('page.proposal_detail.delegators_voted_without_delegate_without_vote', {
        votes: delegatorsVotes,
        total: totalDelegators,
      })
    }

    if (!delegate && !vote) {
      return t('page.proposal_detail.delegators_without_delegate_without_votes', { total: totalDelegators })
    }

    if (!delegate && vote && delegatorsVotes > 0) {
      return t('page.proposal_detail.delegators_voted_without_delegate_with_vote', {
        votes: delegatorsWithoutVotes,
        total: totalDelegators,
      })
    }
  }

  if (!delegators && delegate && !delegateVote) {
    if (vote) {
      return t('page.proposal_detail.delegate_not_voted', { delegate })
    } else {
      return t('page.proposal_detail.delegate_name', { delegate })
    }
  }

  if (!delegators && delegate && delegateVote) {
    if ((vote && vote?.choice === delegateVote.choice) || !vote) {
      return t('page.proposal_detail.delegate_voted', { date: Time.unix(delegateVote.timestamp).fromNow() })
    }

    if (vote && vote?.choice !== delegateVote.choice) {
      return t('page.proposal_detail.delegate_voted_differently')
    }
  }

  return ''
}

interface Props {
  vote: Vote | null
  votes?: Record<string, Vote> | null
  delegateVote?: Vote
  delegate?: string
  delegators?: Delegation[]
}

const DelegateLabel = ({ vote, votes, delegateVote, delegate, delegators }: Props) => {
  const label = useDelegateLabel(vote, votes, delegateVote, delegate, delegators)

  return (
    <span>
      {delegate && <Username address={delegate} />}
      <Markdown className="DelegateLabel">{label}</Markdown>
    </span>
  )
}

export default DelegateLabel
