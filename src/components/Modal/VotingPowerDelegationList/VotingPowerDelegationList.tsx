import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import React, { useMemo, useState } from 'react'

import { snapshotUrl } from '../../../entities/Proposal/utils'
import { Delegate } from '../../../hooks/useDelegatesInfo'

import Sort from '../../Icon/Sort'
import VotingPowerDelegationItem from './VotingPowerDelegationItem'

type VotingPowerDelegationListProps = {
  vp: number
  space: string
  delegates: Delegate[]
  onDelegateClick: (delegate: Delegate) => void
}

function VotinPowerDelegationList({ vp, space, delegates, onDelegateClick }: VotingPowerDelegationListProps) {
  const editDelegationUrl = snapshotUrl(`#/delegate/${space}`)

  const t = useFormatMessage()
  const [isDescending, setIsDescending] = useState(true)

  const delegatesSorted = useMemo(
    () => delegates.sort((a, b) => (isDescending ? b.totalVP - a.totalVP : a.totalVP - b.totalVP)),
    [delegates, isDescending]
  )

  const createDelegateRow = (delegate: Delegate, idx: number) => {
    return <VotingPowerDelegationItem key={idx} delegate={delegate} onClick={() => onDelegateClick(delegate)} />
  }

  return (
    <>
      <Modal.Header>{t('modal.vp_delegation.title')}</Modal.Header>
      <Modal.Description>
        <Markdown>{t('modal.vp_delegation.description', { VP: vp })}</Markdown>
      </Modal.Description>
      <Modal.Content>
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('modal.vp_delegation.candidate_name')}</Table.HeaderCell>
              <Table.HeaderCell>{t('modal.vp_delegation.picked_by')}</Table.HeaderCell>
              <Table.HeaderCell className="TotalVP" onClick={() => setIsDescending((prev) => !prev)}>
                <span>
                  {t('modal.vp_delegation.total_vp')}
                  <Sort rotate={isDescending ? 0 : 180} />
                </span>
              </Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>{delegatesSorted.map(createDelegateRow)}</Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Actions>
        <Button primary href={editDelegationUrl}>
          {t('modal.vp_delegation.button')}
        </Button>
      </Modal.Actions>
    </>
  )
}

export default VotinPowerDelegationList
