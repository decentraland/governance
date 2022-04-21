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
import useVotingPowerBalance from '../../../hooks/useVotingPowerBalance'
import exampleDelegates from '../../../modules/delegates/example_delegates.json'
import locations from '../../../modules/locations'
import Sort from '../../Icon/Sort'
import VotingPowerDelegationItem from './VotingPowerDelegationItem'

export type Delegate = {
  address: string
  total_vp: number
}

type VotingPowerDelegationModalProps = Omit<ModalProps, 'children'> & {
  vp: number
  space: string
}

function VotingPowerDelegationModal({ vp, space, ...props }: VotingPowerDelegationModalProps) {
  const editDelegationUrl = snapshotUrl(`#/delegate/${space}`)

  const t = useFormatMessage()
  const [isDescending, setIsDescending] = useState(true)

  const delegates_with_total_vp = exampleDelegates.map((delegate) => {
    const [votingPower] = useVotingPowerBalance(delegate.address, space)
    return { ...delegate, total_vp: votingPower }
  })
  const delegates = useMemo(
    () => delegates_with_total_vp.sort((a, b) => (isDescending ? b.total_vp - a.total_vp : a.total_vp - b.total_vp)),
    [delegates_with_total_vp, isDescending]
  ) as Delegate[]

  const arrowFilledState: [boolean, React.Dispatch<React.SetStateAction<boolean>>][] = []

  const changeArrowFilledState = (idx: number, state: boolean) => {
    const [isFilled, setIsFilled] = arrowFilledState[idx]
    setIsFilled(state)
  }

  const createDelegateRow = (delegate: Delegate, idx: number) => {
    const [isFilled, setIsFilled] = useState(false)
    arrowFilledState.push([isFilled, setIsFilled])
    return (
      <Table.Row
        key={idx}
        onMouseEnter={() => changeArrowFilledState(idx, true)}
        onMouseLeave={() => changeArrowFilledState(idx, false)}
        onClick={() => {
          navigate(locations.balance({ address: delegate.address }))
          setTimeout(() => {
            props.onClose()
          }, 100)
        }}
      >
        <VotingPowerDelegationItem delegate={delegate} picked_by={0} arrowFilled={isFilled} />
      </Table.Row>
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
          <Table.Body>{delegates.map(createDelegateRow)}</Table.Body>
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
