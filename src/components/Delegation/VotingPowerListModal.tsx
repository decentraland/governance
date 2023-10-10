import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../hooks/useFormatMessage'
import Markdown from '../Common/Typography/Markdown'

import VotingPowerListItem from './VotingPowerListItem'
import './VotingPowerListModal.css'

export type VotingPowerListModalProps = Omit<ModalProps, 'children'> & {
  delegations: { delegator: string; vp: number }[]
  open: boolean
}

export function VotingPowerListModal({ delegations, ...props }: VotingPowerListModalProps) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className="GovernanceContentModal VotingPowerListModal" closeIcon={<Close />}>
      <Modal.Header className="VotingPowerListModal__Header">
        {t('delegation.delegated_voting_power_list_title')}
      </Modal.Header>
      <Modal.Description className="VotingPowerListModal__Description">
        <Markdown>{t('delegation.delegated_voting_power_list_description')}</Markdown>
      </Modal.Description>
      <Modal.Content>
        <div className="VotingPowerListModal_Items">
          {delegations.length > 0 &&
            delegations.map((delegation) => {
              return (
                <VotingPowerListItem
                  className={'VotingPowerListModal_ItemWithDivider'}
                  key={delegation.delegator}
                  address={delegation.delegator}
                  votingPower={delegation.vp}
                />
              )
            })}
        </div>
      </Modal.Content>
    </Modal>
  )
}
