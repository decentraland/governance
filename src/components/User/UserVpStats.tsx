import React from 'react'

import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'

import { UserStatBox } from './UserStatBox'
import './UserVpStats.css'

interface Props {
  address?: string
}

export default function UserVpStats({ address }: Props) {
  if (!address) {
    return null
  }

  const { votingPower, ownVotingPower, delegatedVotingPower, isLoadingVotingPower } = useVotingPowerBalance(address)

  return (
    <div className="UserVpStats__Container">
      <UserStatBox
        title={'Consolidated Voting Power'}
        value={votingPower}
        info={'info text'}
        loading={isLoadingVotingPower}
      />
      <UserStatBox
        title={'Own Voting Power'}
        value={ownVotingPower}
        info={'info text'}
        loading={isLoadingVotingPower}
      />
      <UserStatBox
        title={'Delegated Voting Power'}
        value={delegatedVotingPower}
        info={'info text'}
        loading={isLoadingVotingPower}
      />
    </div>
  )
}
