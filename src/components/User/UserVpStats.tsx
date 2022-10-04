import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { VpDistribution } from '../../clients/SnapshotGraphqlTypes'
import MobileSlider from '../Common/MobileSlider'

import { UserVpBox } from './UserVpBox'
import './UserVpStats.css'

interface Props {
  vpDistribution: VpDistribution | null
  isLoadingVpDistribution: boolean
}

export default function UserVpStats({ vpDistribution, isLoadingVpDistribution }: Props) {
  const t = useFormatMessage()

  return (
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
  )
}
