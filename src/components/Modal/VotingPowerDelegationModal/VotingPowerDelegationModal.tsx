import React, { useCallback, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useDelegatesInfo, { Delegate } from '../../../hooks/useDelegatesInfo'
import useVotingPowerInformation from '../../../hooks/useVotingPowerInformation'
import Candidates from '../../../modules/delegates/candidates.json'
import VotingPowerDelegationDetail from '../VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import VotingPowerDelegationList from '../VotingPowerDelegationList/VotingPowerDelegationList'

import './VotingPowerDelegationModal.css'

type VotingPowerDelegationModalProps = Omit<ModalProps, 'children'>

export type Candidate = Delegate & {
  bio: string
  links: string[]
  relevant_skills: string[]
  involvement: string
  motivation: string
  vision: string
  most_important_issue: string
}

function VotingPowerDelegationModal({ onClose, ...props }: VotingPowerDelegationModalProps) {
  const [userAddress] = useAuthContext()
  const { ownVotingPower } = useVotingPowerInformation(userAddress)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const delegates = useDelegatesInfo(Candidates.map((delegate) => delegate.address))

  const handleOnDelegateClick = (delegate: Delegate) => {
    const candidateInfo = Candidates.find((deleg) => deleg.address.toLowerCase() === delegate.address.toLowerCase())
    setSelectedCandidate({ ...delegate, ...candidateInfo! })
  }

  const handleClose = useCallback(() => {
    onClose()
    setSelectedCandidate(null)
  }, [onClose])

  return (
    <Modal {...props} onClose={handleClose} size="small" closeIcon={<Close />} className="VotingPowerDelegationModal">
      {!selectedCandidate && (
        <VotingPowerDelegationList delegates={delegates} vp={ownVotingPower} onDelegateClick={handleOnDelegateClick} />
      )}
      {selectedCandidate && (
        <VotingPowerDelegationDetail
          userVP={ownVotingPower}
          candidate={selectedCandidate}
          onBackClick={() => setSelectedCandidate(null)}
        />
      )}
    </Modal>
  )
}

export default VotingPowerDelegationModal
