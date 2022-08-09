import React, { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { CANDIDATE_ADDRESSES } from '../../constants'
import useDelegatesInfo from '../../hooks/useDelegatesInfo'
import useVotingPowerInformation from '../../hooks/useVotingPowerInformation'
import FullWidthButton from '../Common/FullWidthButton'
import VotingPowerDelegationDetail from '../Modal/VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import VotingPowerDelegationModal, { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'
import DelegatesTable from '../Table/DelegatesTable'

import HomeSectionHeader from './HomeSectionHeader'

const DaoDelegates = () => {
  const t = useFormatMessage()
  const delegates = useDelegatesInfo(CANDIDATE_ADDRESSES)
  const [isFullList, setIsFullList] = useState(false)
  const [isFullListOpened, setIsFullListOpened] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [address, authState] = useAuthContext()
  const { ownVotingPower } = useVotingPowerInformation(address)
  const loading = !delegates && authState.loading

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
      <Loader active={loading} />
      {!loading && (
        <>
          <DelegatesTable delegates={delegates} setSelectedCandidate={handleSelectedCandidate} full={isFullList} />
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
      {selectedCandidate && (
        <Modal
          onClose={handleModalClose}
          size="small"
          closeIcon={<Close />}
          className="GovernanceContentModal VotingPowerDelegationModal"
          open={!!selectedCandidate}
        >
          <VotingPowerDelegationDetail
            userVP={ownVotingPower}
            candidate={selectedCandidate}
            onBackClick={clearSelectedCandidate}
          />
        </Modal>
      )}
    </div>
  )
}

export default DaoDelegates
