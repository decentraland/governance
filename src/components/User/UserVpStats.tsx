import React, { Suspense, useRef } from 'react'
import Flickity from 'react-flickity-component'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Desktop } from 'decentraland-ui/dist/components/Media/Media'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import { VpDistribution } from '../../clients/SnapshotGraphqlTypes'
import VotingPowerDistribution from '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution'
import { ProfileBox } from '../Profile/ProfileBox'

import { UserVpBox } from './UserVpBox'
import './UserVpStats.css'
import Username from './Username'

const flickityOptions = {
  cellAlign: 'left',
  accessibility: true,
  pageDots: false,
  prevNextButtons: false,
  draggable: true,
  dragThreshold: 10,
  selectedAttraction: 0.01,
  friction: 0.15,
}

interface Props {
  address: string
  vpDistribution: VpDistribution | null
  isLoadingVpDistribution: boolean
}

const UserAvatar = React.lazy(() => import('./UserAvatar'))

export default function UserVpStats({ address, vpDistribution, isLoadingVpDistribution }: Props) {
  const t = useFormatMessage()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const flickity = useRef<Flickity>()

  const userStatBoxes = (
    <div className="UserVpStats__StatBoxes">
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
    </div>
  )
  return (
    <Container className="UserVpStats__Container">
      <div className="UserVpStats__UserInfo">
        <Username address={address} size="medium" className="UserVpStats__Username" />
        <>
          {isMobile ? (
            <Flickity
              className="UserVpStats__Carousel"
              options={flickityOptions}
              flickityRef={(ref) => (flickity.current = ref)}
            >
              {userStatBoxes}
            </Flickity>
          ) : (
            userStatBoxes
          )}
        </>
        <ProfileBox title={t('page.profile.user_vp_stats.vp_distribution')}>
          <VotingPowerDistribution
            vpDistribution={vpDistribution}
            isLoading={isLoadingVpDistribution}
            className="UserVpStats__VpDistribution"
          />
        </ProfileBox>
      </div>
      <Desktop>
        <Suspense fallback={<Loader active={true} size="small" />}>
          <UserAvatar address={address} />
        </Suspense>
      </Desktop>
    </Container>
  )
}
