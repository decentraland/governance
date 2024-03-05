import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import Heading from '../Common/Typography/Heading'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Hourglass from '../Icon/Hourglass'

import './ProposalModal.css'
import './ProposalPendingModal.css'

type ProposalPendingModalProps = Omit<ModalProps, 'children'> & {
  title: string
  description: string
  votingStartsAt?: Date | string
}

export default function ProposalPendingModal({
  title,
  description,
  calendarUrl,
  votingStartsAt,
  ...props
}: ProposalPendingModalProps) {
  const t = useFormatMessage()

  return (
    <Modal
      {...props}
      size="tiny"
      className={classNames('GovernanceContentModal', 'ProposalModal', 'SuccessModal')}
      closeIcon={<Close />}
    >
      <Modal.Content className="ProposalPendingModal__Content">
        <Hourglass />
        <Heading size="sm" weight="semi-bold">
          {title}
        </Heading>
        <Text className="ProposalPendingModal__Description">{description}</Text>
        {votingStartsAt && (
          <Text className="ProposalPendingModal__Description">
            {t('modal.proposal_pending.voting_begins', {
              date: Time.from(votingStartsAt).format('MMM DD, YYYY HH:mm'),
            })}
          </Text>
        )}
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
