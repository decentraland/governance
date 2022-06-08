import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import DelegatedFromUserCard from '../components/Delegation/DelegatedFromUserCard'
import DelegatedToUserCard from '../components/Delegation/DelegatedToUserCard'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import EstateBalanceCard from '../components/Token/EstateBalanceCard'
import LandBalanceCard from '../components/Token/LandBalanceCard'
import ManaBalanceCard from '../components/Token/ManaBalanceCard'
import NameBalanceCard from '../components/Token/NameBalanceCard'
import VotingPower from '../components/Token/VotingPower'
import LogIn from '../components/User/LogIn'
import UserStats from '../components/User/UserStats'
import useVotingPowerInformation from '../hooks/useVotingPowerInformation'
import { isUnderMaintenance } from '../modules/maintenance'

import './balance.css'

export default function BalancePage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [userAddress, authState] = useAuthContext()
  const address = isEthereumAddress(params.get('address') || '') ? params.get('address') : userAddress
  const isLoggedUserProfile = userAddress === address
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
        <Navigation activeTab={NavigationTab.Wrapping} />
        <MaintenancePage />
      </>
    )
  }

  if (authState.loading) {
    return <LoadingView />
  }

  if (!userAddress) {
    return <LogIn title={t('page.balance.title') || ''} description={t('page.balance.description') || ''} />
  }

  return (
    <div className="BalancePage">
      <Head
        title={t('page.balance.title') || ''}
        description={t('page.balance.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Wrapping} />
      <Container className="VotingPowerSummary">
        <UserStats size="huge" className="VotingPowerProfile" address={address || userAddress} />
        <Stats title={t('page.balance.total_label') || ''}>
          <VotingPower value={votingPower} size="huge" />
          <Loader size="small" className="balance" active={isLoadingVotingPower} />
        </Stats>
      </Container>
      <Container className="VotingPowerDetail">
        <ManaBalanceCard address={address} />
        <LandBalanceCard address={address} />
        <EstateBalanceCard address={address} />
        <NameBalanceCard address={address} />
        <DelegatedToUserCard
          isLoggedUserProfile={isLoggedUserProfile}
          delegation={delegation}
          scores={scores}
          loading={delegationState.loading || isLoadingScores}
          delegatedVotingPower={delegatedVotingPower}
        />
        <DelegatedFromUserCard
          isLoggedUserProfile={isLoggedUserProfile}
          delegation={delegation}
          ownVp={ownVotingPower}
        />
      </Container>
    </div>
  )
}
