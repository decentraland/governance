import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { CANDIDATE_ADDRESSES } from '../../../constants'
import { EDIT_DELEGATE_SNAPSHOT_URL } from '../../../entities/Proposal/utils'
import useDelegatesInfo, { Delegate } from '../../../hooks/useDelegatesInfo'
import useVotingPowerDistribution from '../../../hooks/useVotingPowerDistribution'
import DelegatesTable from '../../Delegation/DelegatesTable'

import './VotingPowerDelegationModal.css'

type VotingPowerDelegationModalProps = Omit<ModalProps, 'children'> & {
  setSelectedCandidate: (candidate: Candidate) => void
  showPickOtherDelegateButton?: boolean
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

function VotingPowerDelegationModal({
  onClose,
  setSelectedCandidate,
  showPickOtherDelegateButton,
  ...props
}: VotingPowerDelegationModalProps) {
  const delegates = useDelegatesInfo(CANDIDATE_ADDRESSES)
  const [userAddress] = useAuthContext()
  const { vpDistribution } = useVotingPowerDistribution(userAddress)

  const t = useFormatMessage()

  return (
    <Modal
      {...props}
      onClose={onClose}
      size="small"
      closeIcon={<Close />}
      className="GovernanceContentModal VotingPowerDelegationModal"
    >
      <Modal.Header className="VotingPowerDelegationModal__Header">{t('modal.vp_delegation.title')}</Modal.Header>
      <Modal.Description className="VotingPowerDelegationModal__Description">
        <Markdown>
          {(userAddress && vpDistribution
            ? t('modal.vp_delegation.description', { vp: vpDistribution.own })
            : t('modal.vp_delegation.description_generic')) +
            ' ' +
            t('modal.vp_delegation.read_more')}
        </Markdown>
      </Modal.Description>
      <Modal.Content>
        <DelegatesTable delegates={delegates} setSelectedCandidate={setSelectedCandidate} full />
      </Modal.Content>
      {showPickOtherDelegateButton && (
        <Button
          className="VotingPowerDelegationModal__PickButton"
          fluid
          primary
          href={EDIT_DELEGATE_SNAPSHOT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('modal.vp_delegation.pick_button')}
        </Button>
      )}
    </Modal>
  )
}

export default VotingPowerDelegationModal
