import React from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../hooks/useFormatMessage'
import Heading from '../Common/Typography/Heading'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Clock from '../Icon/Clock'

import './ProposalModal.css'
import './ProposalPendingModal.css'

type ProposalPendingModalProps = Omit<ModalProps, 'children'> & {
  title: string
  description: string
}

export default function ProposalPendingModal({ title, description, calendarUrl, ...props }: ProposalPendingModalProps) {
  const t = useFormatMessage()

  return (
    <Modal
      {...props}
      size="tiny"
      className={classNames('GovernanceContentModal', 'ProposalModal', 'SuccessModal')}
      closeIcon={<Close />}
    >
      <Modal.Content className="ProposalPendingModal__Content">
        <Clock />
        <Heading size="sm" weight="semi-bold">
          {title}
        </Heading>
        <Text className="ProposalPendingModal__Description">{description}</Text>
        <Button
          as={Link}
          disabled={!calendarUrl}
          loading={!calendarUrl}
          href={calendarUrl}
          className="ProposalPendingModal__Button"
          primary
        >
          {t('modal.proposal_pending.add_to_calendar')}
        </Button>
        <Text size="sm" color="secondary">
          {t(`modal.proposal_pending.helper`)}
        </Text>
      </Modal.Content>
    </Modal>
  )
}
