import React from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'

import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import VotingPowerDistribution from '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution'
import { ProfileBox } from '../Profile/ProfileBox'

import UserAvatar from './UserAvatar'
import { UserStatBox } from './UserStatBox'
import './UserVpStats.css'
import Username from './Username'

interface Props {
  address: string
}

export default function UserVpStats({ address }: Props) {
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)

  // TODO: internationalization
  return (
    <Container className="UserVpStats__Container">
      <div>
        <Username address={address} size="medium" className="UserVpStats__Username" />
        <div className="UserVpStats__StatBoxes">
          <UserStatBox
            title={'Consolidated Voting Power'}
            value={vpDistribution?.total}
            info={'info text'}
            loading={isLoadingVpDistribution}
          />
          <UserStatBox
            title={'Own Voting Power'}
            value={vpDistribution?.own}
            info={'info text'}
            loading={isLoadingVpDistribution}
          />
          <UserStatBox
            title={'Delegated Voting Power'}
            value={vpDistribution?.delegated}
            info={'info text'}
            loading={isLoadingVpDistribution}
          />
        </div>
        <ProfileBox title={'Voting Power distribution'} info={'some info'}>
          <VotingPowerDistribution vpDistribution={vpDistribution} isLoading={isLoadingVpDistribution} />
        </ProfileBox>
      </div>
      <UserAvatar address={address} />
    </Container>
  )
}
