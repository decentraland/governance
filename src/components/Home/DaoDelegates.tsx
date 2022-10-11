import React, { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { CANDIDATE_ADDRESSES } from '../../constants'
import useDelegatesInfo from '../../hooks/useDelegatesInfo'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import FullWidthButton from '../Common/FullWidthButton'
import DelegatesTable from '../Delegation/DelegatesTable'
import VotingPowerDelegationDetail from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import VotingPowerDelegationModal, { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'

import './DaoDelegates.css'
import HomeLoader from './HomeLoader'
import HomeSectionHeader from './HomeSectionHeader'

const DaoDelegates = () => {
  const t = useFormatMessage()
  const delegates = useDelegatesInfo(CANDIDATE_ADDRESSES)
  const [isFullList, setIsFullList] = useState(false)
  const [isFullListOpened, setIsFullListOpened] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [address, authState] = useAuthContext()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)
  const loading = !delegates && authState.loading && isLoadingVpDistribution

  const toggleFullList = (state: boolean) => {
    setIsFullList(state)
    setIsFullListOpened(state)
  }

  const handleViewAllDelegatesClick = () => {
    toggleFullList(true)
  }

  const handleSelectedCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    if (isFullList) {
      setIsFullListOpened(false)
    }
  }

  const clearSelectedCandidate = () => {
    setSelectedCandidate(null)
    if (isFullList) {
      setIsFullListOpened(true)
    }
  }

  const handleModalClose = () => {
    setSelectedCandidate(null)
    toggleFullList(false)
  }

  return (
    <div>
      <HomeSectionHeader
        title={t('page.home.dao_delegates.title')}
        description={t('page.home.dao_delegates.description')}
      />
      {loading && (
        <div className="DaoDelegates__Loader">
          <HomeLoader>{t('page.home.dao_delegates.fetching')}</HomeLoader>
        </div>
      )}
      {!loading && (
        <>
          <DelegatesTable delegates={delegates} setSelectedCandidate={handleSelectedCandidate} />
          <FullWidthButton onClick={handleViewAllDelegatesClick}>
            {t(isFullList ? 'modal.vp_delegation.details.show_less' : 'page.home.dao_delegates.view_all_delegates')}
          </FullWidthButton>
        </>
      )}
      <VotingPowerDelegationModal
        onClose={handleModalClose}
        setSelectedCandidate={handleSelectedCandidate}
        open={isFullListOpened}
      />
      {selectedCandidate && vpDistribution && (
        <Modal
          onClose={handleModalClose}
          size="small"
          closeIcon={<Close />}
          className="GovernanceContentModal VotingPowerDelegationModal"
          open={!!selectedCandidate}
        >
          <VotingPowerDelegationDetail
            userVP={vpDistribution.own}
            candidate={selectedCandidate}
            onBackClick={clearSelectedCandidate}
          />
        </Modal>
      )}
    </div>
  )
}

export default DaoDelegates
