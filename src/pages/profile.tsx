import React, { useMemo, useState } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import DelegateVPAction from '../components/Delegation/DelegateVPAction'
import DelegationCards from '../components/Delegation/DelegationCards'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import VotingPowerDelegationDetail from '../components/Modal/VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import { Candidate } from '../components/Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'
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

  const { delegation, delegationState, scores, isLoadingScores, ownVotingPower } = useVotingPowerInformation(address)

  const isUserDelegate = useMemo(
    () => !!delegation.delegatedFrom.find((delegation) => delegation.delegator === userAddress?.toLowerCase()),
    [delegation.delegatedFrom, userAddress]
  )

  const [isModalOpened, setIsModalOpened] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const closeModal = () => setIsModalOpened(false)

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

  return (
    <div className="ProfilePage">
      <Head
        title={t('page.profile.title') || ''}
        description={t('page.profile.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Profile} />
      <Container className="Profile__Container">
        <ProfileBox
          title={t('page.profile.delegators.title')}
          info={t('page.profile.delegators.helper')}
          action={
            !isLoggedUserProfile &&
            address && (
              <DelegateVPAction
                address={address}
                isUserDelegate={isUserDelegate}
                setCandidate={setSelectedCandidate}
                openModal={() => setIsModalOpened(true)}
              />
            )
          }
        >
          <DelegationCards
            delegation={delegation}
            scores={scores}
            isLoading={delegationState.loading || isLoadingScores}
          />
        </ProfileBox>
      </Container>
      {selectedCandidate && (
        <Modal
          onClose={closeModal}
          size="small"
          closeIcon={<Close />}
          className="GovernanceContentModal VotingPowerDelegationModal"
          open={isModalOpened}
        >
          <VotingPowerDelegationDetail userVP={ownVotingPower} candidate={selectedCandidate} onBackClick={closeModal} />
        </Modal>
      )}
    </div>
  )
}
