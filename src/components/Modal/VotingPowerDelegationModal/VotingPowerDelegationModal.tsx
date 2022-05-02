import React, { useState } from 'react'

import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useDelegatesInfo, { Delegate } from '../../../hooks/useDelegatesInfo'
import Candidates from '../../../modules/delegates/candidates.json'
import VotingPowerDelegationDetail from '../VotingPowerDelegationDetail/VotingPowerDelegationDetail'
import VotingPowerDelegationList from '../VotingPowerDelegationList/VotingPowerDelegationList'

import './VotingPowerDelegationModal.css'

type VotingPowerDelegationModalProps = Omit<ModalProps, 'children'> & {
  vp: number
}

export type Candidate = Delegate & {
  bio: string
  links: string[]
  relevant_skills: string[]
  involvement: string
  motivation: string
  vision: string
  most_important_issue: string
}

function VotingPowerDelegationModal({ vp, ...props }: VotingPowerDelegationModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const delegates = useDelegatesInfo(Candidates.map((delegate) => delegate.address))

  const handleOnDelegateClick = (delegate: Delegate) => {
    const candidateInfo = Candidates.find((deleg) => deleg.address.toLowerCase() === delegate.address.toLowerCase())
    setSelectedCandidate({ ...delegate, ...candidateInfo! })
  }

  return (
    <Modal {...props} size="small" closeIcon={<Close />} className="VotingPowerDelegationModal">
      {!selectedCandidate && (
        <VotingPowerDelegationList delegates={delegates} vp={vp} onDelegateClick={handleOnDelegateClick} />
      )}
      {selectedCandidate && (
        <VotingPowerDelegationDetail candidate={selectedCandidate} onBackClick={() => setSelectedCandidate(null)} />
      )}
    </Modal>
  )
}

export default VotingPowerDelegationModal
