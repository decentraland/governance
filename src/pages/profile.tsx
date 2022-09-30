import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import GrantBeneficiaryBox from '../components/Profile/GrantBeneficiaryBox'
import VpDelegatorsBox from '../components/Profile/VpDelegatorsBox'
import LogIn from '../components/User/LogIn'
import UserVotingStats from '../components/User/UserVotingStats'
import UserVpStats from '../components/User/UserVpStats'
import useNameOrAddress from '../hooks/useNameOrAddress'
import useVotingPowerInformation from '../hooks/useVotingPowerInformation'
import { isUnderMaintenance } from '../modules/maintenance'

import './profile.css'

export default function ProfilePage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [userAddress, authState] = useAuthContext()
  const address = isEthereumAddress(params.get('address') || '') ? params.get('address') : userAddress
  const displayedAddress = useNameOrAddress(address)
  const { delegation, delegationState, scores, isLoadingScores, vpDistribution, isLoadingVpDistribution } =
    useVotingPowerInformation(address)

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.profile.empty_title') || ''}
          description={t('page.profile.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Profile} />
        <MaintenancePage />
      </>
    )
  }

  if (authState.loading) {
    return <LoadingView />
  }

  if (!address) {
    return <LogIn title={t('page.profile.empty_title')} description={t('page.profile.description')} />
  }

  return (
    <div className="ProfilePage">
      <Head
        title={t('page.profile.title', { address: displayedAddress })}
        description={t('page.profile.description')}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Profile} />
      <UserVpStats
        address={address}
        vpDistribution={vpDistribution}
        isLoadingVpDistribution={isLoadingVpDistribution}
      />
      <UserVotingStats address={address} />
      <GrantBeneficiaryBox address={address} />
      <VpDelegatorsBox
        address={address}
        delegation={delegation}
        delegationState={delegationState}
        scores={scores}
        isLoadingScores={isLoadingScores}
        vpDistribution={vpDistribution}
      />
    </div>
  )
}
