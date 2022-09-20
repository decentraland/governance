import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { VpDistribution } from '../../clients/SnapshotGraphql'
import VotingPowerDistribution from '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution'
import { ProfileBox } from '../Profile/ProfileBox'

import UserAvatar from './UserAvatar'
import { UserStatBox } from './UserStatBox'
import './UserVpStats.css'
import Username from './Username'

interface Props {
  address: string
  vpDistribution: VpDistribution | null
  isLoadingVpDistribution: boolean
}

export default function UserVpStats({ address, vpDistribution, isLoadingVpDistribution }: Props) {
  const t = useFormatMessage()

  return (
    <Container className="UserVpStats__Container">
      <div className="UserVpStats__UserInfo">
        <Username address={address} size="medium" className="UserVpStats__Username" />
        <div className="UserVpStats__StatBoxes">
          <UserStatBox
            title={t('page.profile.user_vp_stats.consolidated_vp')}
            value={vpDistribution?.total}
            info={t('page.profile.user_vp_stats.consolidated_vp_info')}
            loading={isLoadingVpDistribution}
          />
          <UserStatBox
            title={t('page.profile.user_vp_stats.own_vp')}
            value={vpDistribution?.own}
            info={t('page.profile.user_vp_stats.own_vp_info')}
            loading={isLoadingVpDistribution}
          />
          <UserStatBox
            title={t('page.profile.user_vp_stats.delegated_vp')}
            value={vpDistribution?.delegated}
            info={t('page.profile.user_vp_stats.delegated_vp_info')}
            loading={isLoadingVpDistribution}
          />
        </div>
        <ProfileBox title={t('page.profile.user_vp_stats.vp_distribution')} info={'some info'}>
          <VotingPowerDistribution
            vpDistribution={vpDistribution}
            isLoading={isLoadingVpDistribution}
            className="UserVpStats__VpDistribution"
          />
        </ProfileBox>
      </div>
      <UserAvatar address={address} />
    </Container>
  )
}
