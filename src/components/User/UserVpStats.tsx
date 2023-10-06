import { VpDistribution } from '../../clients/SnapshotTypes'
import useFormatMessage from '../../hooks/useFormatMessage'
import MobileSlider from '../Common/MobileSlider'

import { UserVpBox } from './UserVpBox'

interface Props {
  vpDistribution: VpDistribution | null
  isLoadingVpDistribution: boolean
}

export default function UserVpStats({ vpDistribution, isLoadingVpDistribution }: Props) {
  const t = useFormatMessage()

  return (
    <MobileSlider containerClassName="UserStats__StatBoxes" className="UserStats__Slider">
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
