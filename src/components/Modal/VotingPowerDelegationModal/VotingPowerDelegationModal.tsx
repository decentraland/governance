import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { VpDistribution } from '../../../clients/SnapshotTypes'
import VotingPowerDelegationDetail from '../VotingPowerDelegationDetail/VotingPowerDelegationDetail'

import VotingPowerDelegationCandidatesList, { Candidate } from './VotingPowerDelegationCandidatesList'

type Props = {
  vpDistribution: VpDistribution
  openDelegationModal: boolean
  setOpenDelegationModal: React.Dispatch<any>
  selectedCandidate?: Candidate | null
  setSelectedCandidate: React.Dispatch<React.SetStateAction<Candidate | null>>
  showPickOtherDelegateButton?: boolean
}

const VotingPowerDelegationModal = ({
  vpDistribution,
  openDelegationModal,
  setOpenDelegationModal,
  selectedCandidate,
  setSelectedCandidate,
  showPickOtherDelegateButton,
}: Props) => {
  const handleModalClose = () => {
    setSelectedCandidate(null)
    setOpenDelegationModal(false)
  }

  return (
    <>
      <VotingPowerDelegationCandidatesList
        onClose={handleModalClose}
        setSelectedCandidate={setSelectedCandidate}
        open={openDelegationModal && !selectedCandidate}
        showPickOtherDelegateButton={showPickOtherDelegateButton}
      />
      {selectedCandidate && vpDistribution && (
        <Modal
          onClose={handleModalClose}
          size="small"
          closeIcon={<Close />}
          className="GovernanceContentModal VotingPowerDelegationCandidatesList"
          open={openDelegationModal && !!selectedCandidate}
        >
          <VotingPowerDelegationDetail
            userVP={vpDistribution.own}
            candidate={selectedCandidate}
            onBackClick={() => setSelectedCandidate(null)}
            onUserProfileClick={handleModalClose}
          />
        </Modal>
      )}
    </>
  )
}

export default VotingPowerDelegationModal
