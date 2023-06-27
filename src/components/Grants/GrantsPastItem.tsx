import React, { useCallback } from 'react'

import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { ProposalGrantCategory } from '../../entities/Grant/types'
import { Grant } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import locations, { navigate } from '../../utils/locations'
import ChevronRight from '../Icon/ChevronRight'

import GrantPill from './GrantPill'
import './GrantsPastItem.css'

interface Props {
  grant: Grant
  showSeparator: boolean
}

const GrantsPastItem = ({ grant, showSeparator }: Props) => {
  const t = useFormatMessage()
  const { id, title, configuration, enacted_at, size } = grant
  const handleClick = useCallback(() => navigate(locations.proposal(id)), [id])

  return (
    <>
      <Table.Row
        className="GrantsPastItem__Row"
        key={id}
        onClick={handleClick}
        role="button"
        aria-label={t('page.grants.current_banner.title', { title })}
      >
        <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__FirstCell">{title}</Table.Cell>
        <Table.Cell className="GrantsPastItem__Cell">
          <GrantPill type={configuration.category as ProposalGrantCategory} />
        </Table.Cell>
        <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__Text">
          {enacted_at ? Time.unix(enacted_at).format('MMMM DD, YYYY') : ''}
        </Table.Cell>
        <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__Text">{`$${size} USD`}</Table.Cell>
        <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__LastCell">
          <ChevronRight color="#bab8ba" />
        </Table.Cell>
      </Table.Row>
      {showSeparator && <tr className="GrantsPastItem__Separator" />}
    </>
  )
}

export default GrantsPastItem
