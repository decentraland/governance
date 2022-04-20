import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Vote } from '../../entities/Votes/types'
import Username from '../User/Username'

const useDelegateLabel = (vote: Vote | null, delegateVote: Vote | undefined, delegate: string): string => {
  const t = useFormatMessage()

  if (!delegateVote) {
    if (vote) {
      return t('page.proposal_detail.delegate_not_voted', { delegate })
    } else {
      return t('page.proposal_detail.delegate_name', { delegate })
    }
  }

  if (delegateVote) {
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
  delegateVote?: Vote
  delegate: string
}

const DelegateLabel = ({ vote, delegateVote, delegate }: Props) => {
  const label = useDelegateLabel(vote, delegateVote, delegate)

  return (
    <span>
      <Username address={delegate} />
      {label}
    </span>
  )
}

export default DelegateLabel
