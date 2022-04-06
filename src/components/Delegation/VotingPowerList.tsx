import React from 'react'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Delegation } from '../../hooks/useDelegation'
import VotingPowerListItem from './VotingPowerListItem'

import './VotingPowerList.css'

export type VotingPowerListProps = Omit<ModalProps, 'children'> & {
  delegators: Delegation[]
  scores: Record<string, number> | null
  open: boolean
}

export function VotingPowerList({ delegators, scores, ...props }: VotingPowerListProps) {
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
          {t.markdown('page.balance.delegated_voting_power_list_description')}
        </div>
        <div className="VotingPowerList_Items">
          {delegators.length > 0 &&
            delegators.map((delegation) => {
              const key = [delegation.delegate, delegation.delegator].join('::')
              return (
                <VotingPowerListItem
                  className={'VotingPowerList_ItemWithDivider'}
                  key={key}
                  address={delegation.delegator}
                  votingPower={scores && scores[delegation.delegator.toLowerCase()]}
                />
              )
            })}
        </div>
      </div>
    </Modal>
  )
}
