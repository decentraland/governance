import { useMemo } from 'react'

import { useLocation } from '@reach/router'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import WiderContainer from '../components/Common/WiderContainer'
import Head from '../components/Layout/Head'
import LoadingView from '../components/Layout/LoadingView'
import LogIn from '../components/Layout/LogIn'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import ActivityBox from '../components/Profile/ActivityBox'
import GrantBeneficiaryBox from '../components/Profile/GrantBeneficiaryBox'
import VotedProposalsBox from '../components/Profile/VotedProposalsBox'
import VpDelegationBox from '../components/Profile/VpDelegationBox'
import VpDelegatorsBox from '../components/Profile/VpDelegatorsBox'
import UserStats from '../components/User/UserStats'
import { useAuthContext } from '../front/context/AuthProvider'
import useDclProfile from '../hooks/useDclProfile'
import useFormatMessage from '../hooks/useFormatMessage'
import useVotingPowerInformation from '../hooks/useVotingPowerInformation'
import locations, { navigate } from '../utils/locations'
import { isUnderMaintenance } from '../utils/maintenance'

import './profile.css'

export default function ProfilePage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [userAddress, authState] = useAuthContext()

  const paramAddress = params.get('address')
  const hasAddress = isEthereumAddress(paramAddress || '')
  const address = hasAddress ? paramAddress : userAddress

  if (!hasAddress) {
    navigate(`/profile/?address=${userAddress}`, { replace: true })
  }

  const { profile } = useDclProfile(address)
  const { delegation, isDelegationLoading, scores, isLoadingScores, vpDistribution, isLoadingVpDistribution } =
    useVotingPowerInformation(address)

  const { description: profileBio } = profile

  if (isUnderMaintenance()) {
    return (
      <MaintenanceLayout
        title={t('page.profile.empty_title')}
        description={t('page.profile.description')}
        activeTab={NavigationTab.Profile}
      />
    )
  }

  if (authState.loading) {
    return <LoadingView />
  }

  if (!address) {
    return <LogIn title={t('page.profile.empty_title')} description={t('page.profile.description')} />
  }

  return (
    <>
      <Head
        title={t('page.profile.title', { address: profile.username || address })}
        description={t('page.profile.description')}
        links={[{ rel: 'canonical', href: locations.profile({ address: address }) }]}
      />
      <Navigation activeTab={NavigationTab.Profile} />
      <WiderContainer className="ProfilePage__Container">
        <UserStats
          address={address}
          vpDistribution={vpDistribution}
          isLoadingVpDistribution={isLoadingVpDistribution}
          bio={profileBio}
        />
        <GrantBeneficiaryBox address={address} />
        <ActivityBox address={address} />
        <VpDelegationBox
          address={address}
          delegation={delegation}
          isLoadingDelegation={isDelegationLoading}
          ownVp={vpDistribution?.own}
          isLoadingOwnVp={isLoadingVpDistribution}
        />
        <VpDelegatorsBox
          profileAddress={address}
          userAddress={userAddress}
          delegation={delegation}
          isLoadingDelegation={isDelegationLoading}
          scores={scores}
          isLoadingScores={isLoadingScores}
        />
        <VotedProposalsBox address={address} />
      </WiderContainer>
    </>
  )
}
