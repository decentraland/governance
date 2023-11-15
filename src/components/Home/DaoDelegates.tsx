import { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { CANDIDATE_ADDRESSES } from '../../constants'
import useDelegatesInfo from '../../hooks/useDelegatesInfo'
import useFormatMessage from '../../hooks/useFormatMessage'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import FullWidthButton from '../Common/FullWidthButton'
import DelegatesTable from '../Delegation/DelegatesTable'
import { Candidate } from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationCandidatesList'
import VotingPowerDelegationModal from '../Modal/VotingPowerDelegationModal/VotingPowerDelegationModal'

import './DaoDelegates.css'
import HomeLoader from './HomeLoader'
import HomeSectionHeader from './HomeSectionHeader'

const DaoDelegates = () => {
  const t = useFormatMessage()
  const delegates = useDelegatesInfo(CANDIDATE_ADDRESSES)
  const [openDelegationModal, setOpenDelegationModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [address, authState] = useAuthContext()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)
  const isLoading = !delegates || authState.loading || isLoadingVpDistribution

  const handleViewAllDelegatesClick = () => {
    setSelectedCandidate(null)
    setOpenDelegationModal(true)
  }

  const handleSelectedCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setOpenDelegationModal(true)
  }

  return (
    <div className="DaoDelegates">
      <HomeSectionHeader
        title={t('page.home.dao_delegates.title')}
        description={t('page.home.dao_delegates.description')}
      />
      {isLoading && (
        <div className="DaoDelegates__Loader">
          <HomeLoader>{t('page.home.dao_delegates.fetching')}</HomeLoader>
        </div>
      )}
      {!isLoading && (
        <>
          <DelegatesTable delegates={delegates} setSelectedCandidate={handleSelectedCandidate} />
          <FullWidthButton onClick={handleViewAllDelegatesClick}>
            {t('page.home.dao_delegates.view_all_delegates')}
          </FullWidthButton>
        </>
      )}
      {!isLoadingVpDistribution && vpDistribution && (
        <VotingPowerDelegationModal
          vpDistribution={vpDistribution}
          openDelegationModal={openDelegationModal}
          setOpenDelegationModal={setOpenDelegationModal}
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={setSelectedCandidate}
        />
      )}
    </div>
  )
}

export default DaoDelegates
