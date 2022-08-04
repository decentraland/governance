import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { EDIT_DELEGATE_SNAPSHOT_URL } from '../../../entities/Proposal/utils'
import { Delegate } from '../../../hooks/useDelegatesInfo'
import { useSortingByKey } from '../../../hooks/useSortingByKey'
import Sort from '../../Icon/Sort'

import VotingPowerDelegationItem from './VotingPowerDelegationItem'

type VotingPowerDelegationListProps = {
  vp: number
  delegates: Delegate[]
  onDelegateClick: (delegate: Delegate) => void
}

function VotingPowerDelegationList({ vp, delegates, onDelegateClick }: VotingPowerDelegationListProps) {
  const t = useFormatMessage()
  const { sorted: delegatesSorted, changeSort, isDescendingSort } = useSortingByKey(delegates, 'totalVP')

  const createDelegateRow = (delegate: Delegate, idx: number) => {
    return <VotingPowerDelegationItem key={idx} delegate={delegate} onClick={() => onDelegateClick(delegate)} />
  }

  return (
    <>
      <Modal.Header className="VotingPowerDelegationModal__Header">{t('modal.vp_delegation.title')}</Modal.Header>
      <Modal.Description className="VotingPowerDelegationModal__Description">
        <Markdown>{t('modal.vp_delegation.description', { vp })}</Markdown>
      </Modal.Description>
      <Modal.Content>
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('modal.vp_delegation.candidate_name')}</Table.HeaderCell>
              <Table.HeaderCell>{t('modal.vp_delegation.picked_by')}</Table.HeaderCell>
              <Table.HeaderCell className="TotalVP" onClick={changeSort}>
                <span>
                  {t('modal.vp_delegation.total_vp')}
                  <Sort descending={isDescendingSort} />
                </span>
              </Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>{delegatesSorted.map(createDelegateRow)}</Table.Body>
        </Table>
      </Modal.Content>
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
    </>
  )
}

export default VotingPowerDelegationList
