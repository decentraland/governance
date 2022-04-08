import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import React from 'react'

import VotingPowerListItem from './VotingPowerListItem'
import './VotingPowerList.css'

export type VotingPowerListProps = Omit<ModalProps, 'children'> & {
  delegations: { delegator: string; vp: number }[]
  open: boolean
}

export function VotingPowerList({ delegations, scores, ...props }: VotingPowerListProps) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className="VotingPowerList">
      <div className="VotingPowerList__Content">
        <div className="VotingPowerList__Header">
          {t('page.balance.delegated_voting_power_list_title')}
          <Close onClick={props.onClose}
          />
        </div>
        <div className="VotingPowerList_Description">
          <Markdown>{t('page.balance.delegated_voting_power_list_description')}</Markdown>
        </div>
        <div className="VotingPowerList_Items">
          {delegations.length > 0 &&
          delegations.map((delegation) => {
              return (
                <VotingPowerListItem
                  className={'VotingPowerList_ItemWithDivider'}
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
