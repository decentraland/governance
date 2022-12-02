import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Container } from 'decentraland-ui'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import ActivityBox from '../components/Profile/ActivityBox'
import GrantBeneficiaryBox from '../components/Profile/GrantBeneficiaryBox'
import ProposalsCreatedBox from '../components/Profile/ProposalsCreatedBox'
import VotedProposalsBox from '../components/Profile/VotedProposalsBox'
import VpDelegationBox from '../components/Profile/VpDelegationBox'
import VpDelegatorsBox from '../components/Profile/VpDelegatorsBox'
import LogIn from '../components/User/LogIn'
import UserStats from '../components/User/UserStats'
import { isSameAddress } from '../entities/Snapshot/utils'
import useProfile from '../hooks/useProfile'
import useVotingPowerInformation from '../hooks/useVotingPowerInformation'
import { isUnderMaintenance } from '../modules/maintenance'

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

  const { displayableAddress } = useProfile(address)
  const { delegation, delegationState, scores, isLoadingScores, vpDistribution, isLoadingVpDistribution } =
    useVotingPowerInformation(address)

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

  const isLoggedUserProfile = isSameAddress(userAddress, address)

  return (
    <BurgerMenuLayout navigationOnly activeTab={NavigationTab.Profile}>
      <Head
        title={t('page.profile.title', { address: displayableAddress })}
        description={t('page.profile.description')}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Profile} />
      <UserStats address={address} vpDistribution={vpDistribution} isLoadingVpDistribution={isLoadingVpDistribution} />
      <div className="ProfilePage__Container">
        <GrantBeneficiaryBox address={address} />
        {isLoggedUserProfile ? (
          <Container>
            <ActivityBox />
          </Container>
        ) : (
          <ProposalsCreatedBox address={address} />
        )}
        <VpDelegationBox
          delegation={delegation}
          isLoadingDelegations={delegationState.loading}
          ownVp={vpDistribution?.own}
          isLoadingOwnVp={isLoadingVpDistribution}
        />
        <VpDelegatorsBox
          address={address}
          delegation={delegation}
          delegationState={delegationState}
          scores={scores}
          isLoadingScores={isLoadingScores}
          vpDistribution={vpDistribution}
        />
        <VotedProposalsBox address={address} />
      </div>
    </BurgerMenuLayout>
  )
}
