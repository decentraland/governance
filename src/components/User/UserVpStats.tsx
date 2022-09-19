import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
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
  const t = useFormatMessage()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)

  return (
    <Container className="UserVpStats__Container">
      <div>
        <Username address={address} size="medium" className="UserVpStats__Username" />
        <div className="UserVpStats__StatBoxes">
          <UserStatBox
            title={t('page.profile.user_vp_stats.consolidated_vp')}
            value={vpDistribution?.total}
            info={'info text'}
            loading={isLoadingVpDistribution}
          />
          <UserStatBox
            title={t('page.profile.user_vp_stats.own_vp')}
            value={vpDistribution?.own}
            info={'info text'}
            loading={isLoadingVpDistribution}
          />
          <UserStatBox
            title={t('page.profile.user_vp_stats.delegated_vp')}
            value={vpDistribution?.delegated}
            info={'info text'}
            loading={isLoadingVpDistribution}
          />
        </div>
        <ProfileBox title={t('page.profile.user_vp_stats.vp_distribution')} info={'some info'}>
          <VotingPowerDistribution vpDistribution={vpDistribution} isLoading={isLoadingVpDistribution} />
        </ProfileBox>
      </div>
      <UserAvatar address={address} />
    </Container>
  )
}
