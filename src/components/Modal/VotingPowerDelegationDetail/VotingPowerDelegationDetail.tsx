import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import React from 'react'
import { Delegate } from '../../../hooks/useDelegatesInfo'
import ChevronLeft from '../../Icon/ChevronLeft'

type VotingPowerDelegationDetailProps = {
  delegate: Delegate
  onBackClick: () => void
}

function VotingPowerDelegationDetail({ delegate, onBackClick }: VotingPowerDelegationDetailProps) {
  const t = useFormatMessage()

  return (
    <Modal.Header>
      <Button basic aria-label={t('modal.vp_delegation.backButtonLabel')} onClick={onBackClick}>
        <ChevronLeft />
      </Button>
      {delegate.address}
    </Modal.Header>
  )
}

export default VotingPowerDelegationDetail
