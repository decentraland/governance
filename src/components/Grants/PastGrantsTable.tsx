import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { GrantAttributes } from '../../entities/Proposal/types'
import Sort from '../Icon/Sort'

import GrantsPastItem from './GrantsPastItem'
import './PastGrantsTable.css'

interface Props {
  sortedGrants: GrantAttributes[]
  onSortClick: () => void
  isDescendingSort: boolean
}

const PastGrantsTable = ({ sortedGrants, onSortClick, isDescendingSort }: Props) => {
  const t = useFormatMessage()

  return (
    <Table basic="very">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader">
            {t('page.grants.past_funded.title')}
          </Table.HeaderCell>
          <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderCategory">
            {t('page.grants.past_funded.category')}
          </Table.HeaderCell>
          <Table.HeaderCell
            className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderClickable GrantsPage__PastGrantsTableHeaderCategory"
            onClick={onSortClick}
          >
            <span>
              {t('page.grants.past_funded.start_date')}
              <Sort rotate={isDescendingSort ? 0 : 180} />
            </span>
          </Table.HeaderCell>
          <Table.HeaderCell className="GrantsPage__PastGrantsTableHeader GrantsPage__PastGrantsTableHeaderCategory">
            {t('page.grants.past_funded.size')}
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedGrants.map((grant, index) => (
          <GrantsPastItem key={grant.id} grant={grant} showSeparator={sortedGrants.length - 1 !== index} />
        ))}
      </Table.Body>
    </Table>
  )
}

export default PastGrantsTable
