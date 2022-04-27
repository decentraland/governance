import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import React from 'react'
import useProfile from '../../../hooks/useProfile'
import ChevronLeft from '../../Icon/ChevronLeft'
import { Candidate } from '../VotingPowerDelegationModal/VotingPowerDelegationModal'
import './VotingPowerDelegationDetail.css'

type VotingPowerDelegationDetailProps = {
  candidate: Candidate
  onBackClick: () => void
}

function VotingPowerDelegationDetail({ candidate, onBackClick }: VotingPowerDelegationDetailProps) {
  const t = useFormatMessage()
  const { profile } = useProfile(candidate.address)

  return (
    <>
    <Modal.Header className='VotingPowerDelegationDetail'>
      <Button basic aria-label={t('modal.vp_delegation.backButtonLabel')} onClick={onBackClick}>
        <ChevronLeft />
      </Button>
      <Avatar size="small" address={candidate.address} />
      {profile?.name || <Address value={candidate.address} />}
    </Modal.Header>
    <Modal.Content><p>{candidate.bio}</p></Modal.Content>
    </>
  )
}

export default VotingPowerDelegationDetail
