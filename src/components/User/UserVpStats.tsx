import React, { Suspense } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { VpDistribution } from '../../clients/SnapshotGraphqlTypes'
import MobileSlider from '../Common/MobileSlider'
import VotingPowerDistribution from '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution'
import { ProfileBox } from '../Profile/ProfileBox'

import { UserVpBox } from './UserVpBox'
import './UserVpStats.css'
import Username from './Username'

interface Props {
  address: string
  vpDistribution: VpDistribution | null
  isLoadingVpDistribution: boolean
}

const UserAvatar = React.lazy(() => import('./UserAvatar'))

export default function UserVpStats({ address, vpDistribution, isLoadingVpDistribution }: Props) {
  const t = useFormatMessage()

  return (
    <Container className="UserVpStats__Container">
      <div className="UserVpStats__UserInfo">
        <Username address={address} size="medium" className="UserVpStats__Username" />
        <MobileSlider containerClassName="UserVpStats__StatBoxes" className={'UserVpStats__Slider'}>
          <UserVpBox
            title={t('page.profile.user_vp_stats.consolidated_vp')}
            value={vpDistribution?.total}
            info={t('page.profile.user_vp_stats.consolidated_vp_info')}
            loading={isLoadingVpDistribution}
          />
          <UserVpBox
            title={t('page.profile.user_vp_stats.own_vp')}
            value={vpDistribution?.own}
            info={t('page.profile.user_vp_stats.own_vp_info')}
            loading={isLoadingVpDistribution}
          />
          <UserVpBox
            title={t('page.profile.user_vp_stats.delegated_vp')}
            value={vpDistribution?.delegated}
            info={t('page.profile.user_vp_stats.delegated_vp_info')}
            loading={isLoadingVpDistribution}
          />
        </MobileSlider>
        <ProfileBox title={t('page.profile.user_vp_stats.vp_distribution')}>
          <VotingPowerDistribution
            vpDistribution={vpDistribution}
            isLoading={isLoadingVpDistribution}
            className="UserVpStats__VpDistribution"
          />
        </ProfileBox>
      </div>
      <NotMobile>
        <Suspense fallback={<Loader active={true} size="small" />}>
          <UserAvatar address={address} />
        </Suspense>
      </NotMobile>
    </Container>
  )
}
