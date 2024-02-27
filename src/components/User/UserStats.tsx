import { Suspense, lazy } from 'react'

import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { NotMobile, useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { VpDistribution } from '../../clients/SnapshotTypes'
import { isSameAddress } from '../../entities/Snapshot/utils'
import { useAuthContext } from '../../front/context/AuthProvider'
import useFormatMessage from '../../hooks/useFormatMessage'
import useGovernanceProfile from '../../hooks/useGovernanceProfile'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import { ActionBox } from '../Common/ActionBox'
import Username from '../Common/Username'
import VotingPowerDistribution from '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution'
import ProfileSettings from '../Profile/ProfileSettings'

import Badges from './Badges/Badges'

import GetVpDropdown from './GetVpDropdown'
import './UserStats.css'
import UserVotingStats from './UserVotingStats'
import UserVpStats from './UserVpStats'
import ValidatedProfileCheck from './ValidatedProfileCheck'

interface Props {
  address: string
  vpDistribution: VpDistribution | null
  isLoadingVpDistribution: boolean
}

const UserAvatar = lazy(() => import('./UserAvatar'))

export default function UserStats({ address, vpDistribution, isLoadingVpDistribution }: Props) {
  const t = useFormatMessage()
  const isMobile = useMobileMediaQuery()
  const { profile, isLoadingGovernanceProfile } = useGovernanceProfile(address)
  const { isProfileValidated } = useIsProfileValidated(address)
  const [user] = useAuthContext()

  const isLoggedInUserProfile = isSameAddress(user, address)
  const showSettings = isLoggedInUserProfile && !isLoadingGovernanceProfile && !isProfileValidated
  const { total } = vpDistribution || { total: 0 }

  return (
    <div className="UserStats">
      <div>
        <div className="UserStats__UsernameRow">
          <div className="UserStats__UsernameContainer">
            <Username address={address} size={isMobile ? 'sm' : 'md'} className="UserStats__Username" />
            <ValidatedProfileCheck forumUsername={profile?.forum_username} isLoading={isLoadingGovernanceProfile} />
            {showSettings && <ProfileSettings />}
          </div>
          {isLoggedInUserProfile && (
            <div className="UserStats__GetVpDropdownContainer">
              <GetVpDropdown />
            </div>
          )}
        </div>
        <Badges address={address} />
      </div>
      <div className="UserStats__UserInfoContainer">
        <div className="UserStats__UserInfo">
          <UserVpStats vpDistribution={vpDistribution} isLoadingVpDistribution={isLoadingVpDistribution} />
          {total > 0 && (
            <ActionBox title={t('page.profile.user_vp_stats.vp_distribution')} className="UserStats__VpDistributionBox">
              <VotingPowerDistribution
                vpDistribution={vpDistribution}
                isLoading={isLoadingVpDistribution}
                className="UserStats__VpDistribution"
              />
            </ActionBox>
          )}
          <UserVotingStats address={address} />
        </div>
        <NotMobile>
          <Suspense fallback={<Loader active={true} size="small" />}>
            <UserAvatar address={address} />
          </Suspense>
        </NotMobile>
      </div>
    </div>
  )
}
