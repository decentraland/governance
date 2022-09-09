import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import DelegationCards from '../components/Delegation/DelegationCards'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { ProfileBox } from '../components/Profile/ProfileBox'
import LogIn from '../components/User/LogIn'
import useVotingPowerInformation from '../hooks/useVotingPowerInformation'
import { isUnderMaintenance } from '../modules/maintenance'

export default function ProfilePage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [userAddress, authState] = useAuthContext()
  const address = isEthereumAddress(params.get('address') || '') ? params.get('address') : userAddress
  const isLoggedUserProfile = userAddress === address
  console.log(address)

  const {
    votingPower,
    isLoadingVotingPower,
    delegation,
    delegationState,
    scores,
    isLoadingScores,
    delegatedVotingPower,
    ownVotingPower,
  } = useVotingPowerInformation(address)

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.balance.title') || ''}
          description={t('page.balance.description') || ''}
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

  if (!userAddress) {
    return <LogIn title={t('page.profile.title') || ''} description={t('page.profile.description') || ''} />
  }

  const test = true

  return (
    <div className="BalancePage">
      <Head
        title={t('page.profile.title') || ''}
        description={t('page.profile.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Profile} />
      <Container className="Profile__Container">
        <ProfileBox title={t('page.profile.delegators.title')} info={t('page.profile.delegators.helper')}>
          <DelegationCards delegation={delegation} scores={scores} />
        </ProfileBox>
      </Container>
    </div>
  )
}
