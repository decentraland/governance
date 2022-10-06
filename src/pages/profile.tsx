import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Mobile } from 'decentraland-ui/dist/components/Media/Media'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import BurgerMenuContent from '../components/Layout/BurgerMenu/BurgerMenuContent'
import BurgerMenuPushableLayout from '../components/Layout/BurgerMenu/BurgerMenuPushableLayout'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import GrantBeneficiaryBox from '../components/Profile/GrantBeneficiaryBox'
import VpDelegationBox from '../components/Profile/VpDelegationBox'
import VpDelegatorsBox from '../components/Profile/VpDelegatorsBox'
import LogIn from '../components/User/LogIn'
import UserStats from '../components/User/UserStats'
import useProfile from '../hooks/useProfile'
import useVotingPowerInformation from '../hooks/useVotingPowerInformation'
import { isUnderMaintenance } from '../modules/maintenance'

import './profile.css'

export default function ProfilePage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [userAddress, authState] = useAuthContext()
  const address = isEthereumAddress(params.get('address') || '') ? params.get('address') : userAddress
  const { displayableAddress } = useProfile(address)
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
    <>
      <Mobile>
        <BurgerMenuContent className="Padded" navigationOnly activeTab={NavigationTab.Profile} />
      </Mobile>
      <BurgerMenuPushableLayout>
        <div className="ProfilePage">
          <Head
            title={t('page.profile.title', { address: displayableAddress })}
            description={t('page.profile.description')}
            image="https://decentraland.org/images/decentraland.png"
          />
          <Navigation activeTab={NavigationTab.Profile} />
          <UserStats
            address={address}
            vpDistribution={vpDistribution}
            isLoadingVpDistribution={isLoadingVpDistribution}
          />
          <GrantBeneficiaryBox address={address} />
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
        </div>
      </BurgerMenuPushableLayout>
    </>
  )
}
