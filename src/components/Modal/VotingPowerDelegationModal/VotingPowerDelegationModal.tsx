import './VotingPowerDelegationModal.css'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import React, { useMemo, useState } from 'react'

import { snapshotUrl } from '../../../entities/Proposal/utils'
import useDelegatesInfo, { Delegate } from '../../../hooks/useDelegatesInfo'
import exampleDelegates from '../../../modules/delegates/example_delegates.json'
import locations from '../../../modules/locations'
import Sort from '../../Icon/Sort'
import VotingPowerDelegationItem from './VotingPowerDelegationItem'

type VotingPowerDelegationModalProps = Omit<ModalProps, 'children'> & {
  vp: number
  space: string
}

function VotingPowerDelegationModal({ vp, space, ...props }: VotingPowerDelegationModalProps) {
  const editDelegationUrl = snapshotUrl(`#/delegate/${space}`)

  const t = useFormatMessage()
  const [isDescending, setIsDescending] = useState(true)

  const delegates = useDelegatesInfo(exampleDelegates.map((deleg) => deleg.address))

  const delegatesSorted = useMemo(
    () => delegates.sort((a, b) => (isDescending ? b.totalVP - a.totalVP : a.totalVP - b.totalVP)),
    [delegates, isDescending]
  )

  const createDelegateRow = (delegate: Delegate, idx: number) => {
    return (
      <VotingPowerDelegationItem
        key={idx}
        delegate={delegate}
        onClick={() => {
          navigate(locations.balance({ address: delegate.address }))
          setTimeout(() => {
            props.onClose()
          }, 100)
        }}
      />
    )
  }

  return (
    <Modal {...props} size="small" closeIcon={<Close />} className="VotingPowerDelegationModal">
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
    </Modal>
  )
}

export default VotingPowerDelegationModal
