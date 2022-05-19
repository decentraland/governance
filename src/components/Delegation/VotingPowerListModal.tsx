import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import VotingPowerListItem from './VotingPowerListItem'
import './VotingPowerListModal.css'

export type VotingPowerListModalProps = Omit<ModalProps, 'children'> & {
  delegations: { delegator: string; vp: number }[]
  open: boolean
}

export function VotingPowerListModal({ delegations, ...props }: VotingPowerListModalProps) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className="VotingPowerListModal">
      <div className="VotingPowerListModal__Content">
        <div className="VotingPowerListModal__Header">
          {t('page.balance.delegated_voting_power_list_title')}
          <Close onClick={props.onClose} />
        </div>
        <div className="VotingPowerListModal_Description">
          <Markdown>{t('page.balance.delegated_voting_power_list_description')}</Markdown>
        </div>
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
      </div>
    </Modal>
  )
}
