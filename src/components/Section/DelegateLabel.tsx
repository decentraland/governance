import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useProfile from '../../hooks/useProfile'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Vote } from '../../entities/Votes/types'
import locations from '../../modules/locations'

const Username = ({ address }: { address: string }) => {
  const { profile } = useProfile(address)

  return (
    <Link className="DetailsSection__Value" href={locations.balance({ address: address })}>
      {profile && profile.name && <Avatar size="mini" address={profile.ethAddress} style={{ marginRight: '.5rem' }} />}
      {profile && profile.name}
      {(!profile || !profile.name) && !!address && (
        <Blockie scale={3} seed={address || ''}>
          <Address value={address || ''} />
        </Blockie>
      )}
    </Link>
  )
}

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
