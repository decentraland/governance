import './VPDelegationModal.css'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import React, { useRef, useMemo, useState } from 'react'
import { IntlShape } from 'react-intl'

import { snapshotUrl } from '../../entities/Proposal/utils'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import exampleDelegates from '../../modules/delegates/example_delegates.json'
import locations from '../../modules/locations'
import Sort from '../Icon/Sort'

type Delegate = {
  address: string
  ens_name: string | undefined
  total_vp: number
}

type VPDelegationModalProps = Omit<ModalProps, 'children'> & {
  vp: number
  space: string
}

function addressShortener(address: string) {
  return address.substring(0, 6) + '...' + address.substring(38, 42)
}

function tableCell(delegate: Delegate, picked_by: number, intl: IntlShape, arrowRef: React.RefObject<HTMLDivElement>) {
  return (
    <>
      <Table.Cell>
        <span className="Candidate">
          <Avatar address={delegate.address} size="small" />
          {delegate.ens_name || addressShortener(delegate.address)}
        </span>
      </Table.Cell>
      <Table.Cell>{intl.formatNumber(picked_by)}</Table.Cell>
      <Table.Cell>{intl.formatNumber(delegate.total_vp)}</Table.Cell>
      <Table.Cell>
        <div ref={arrowRef} className="Arrow" />
      </Table.Cell>
    </>
  )
}

function VPDelegationModal({ vp, space, ...props }: VPDelegationModalProps) {
  const EDIT_DELEGATION_URL = snapshotUrl(`#/delegate/${space}`)

  const t = useFormatMessage()
  const intl = useIntl()
  const [isDescending, setIsDescending] = useState(true)

  const delegates_with_total_vp = exampleDelegates.map((dgt) => {
    const [votingPower] = useVotingPowerBalance(dgt.address, space)
    return { ...dgt, total_vp: votingPower }
  })
  const delegates = useMemo(
    () => delegates_with_total_vp.sort((a, b) => (isDescending ? b.total_vp - a.total_vp : a.total_vp - b.total_vp)),
    [delegates_with_total_vp, isDescending]
  ) as Delegate[]

  const arrowRefs: React.RefObject<HTMLDivElement>[] = []

  return (
    <Modal {...props} closeIcon={<Close />} className="VPDelegationModal">
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
          <Table.Body>
            {delegates.map((dgt, idx) => {
              const ref = useRef<HTMLDivElement | null>(null)
              arrowRefs.push(ref)
              return (
                <Table.Row
                  key={idx}
                  onMouseEnter={() => arrowRefs[idx].current?.classList.add('Filled')}
                  onMouseLeave={() => arrowRefs[idx].current?.classList.remove('Filled')}
                  onClick={() => {
                    navigate(locations.balance({ address: dgt.address }))
                    setTimeout(() => {
                      props.onClose()
                    }, 100)
                  }}
                >
                  {tableCell(dgt, 0, intl, ref)}
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Actions>
        <Button primary href={EDIT_DELEGATION_URL}>
          {t('modal.vp_delegation.button')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default VPDelegationModal
