import React, { useCallback } from 'react'

import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { GrantAttributes } from '../../entities/Proposal/types'
import locations from '../../modules/locations'
import ChevronRight from '../Icon/ChevronRight'

import GrantCategoryLabel from './GrantCategoryLabel'
import './GrantsPastItem.css'

const GrantsPastItem = ({ grant }: { grant: GrantAttributes }) => {
  const { id, title, configuration, start_at } = grant

  const handleClick = useCallback(() => navigate(locations.proposal(id)), [id])

  return (
    <Table.Row
      className="GrantsPastItem__Row"
      key={id}
      onClick={handleClick}
      role="button"
      aria-label={`Navigate to proposal ${grant.title}`}
    >
      <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__FirstCell">{title}</Table.Cell>
      <Table.Cell className="GrantsPastItem__Cell">
        <GrantCategoryLabel category={configuration.category} />
      </Table.Cell>
      <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__Text">
        {Time(start_at).format('MMMM DD, YYYY')}
      </Table.Cell>
      <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__Text">{`$${configuration.size} USD`}</Table.Cell>
      <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__LastCell">
        <ChevronRight color="#bab8ba" />
      </Table.Cell>
    </Table.Row>
  )
}

export default GrantsPastItem
