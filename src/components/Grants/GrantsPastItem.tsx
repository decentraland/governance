import React, { useCallback } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { GrantAttributes, ProposalGrantCategory, ProposalGrantCategoryColor } from '../../entities/Proposal/types'
import locations from '../../modules/locations'
import Pill from '../Common/Pill'
import ChevronRight from '../Icon/ChevronRight'

import './GrantsPastItem.css'

const GrantsPastItem = ({ grant }: { grant: GrantAttributes }) => {
  const t = useFormatMessage()
  const { id, title, configuration, start_at } = grant
  const category = configuration.category.split(' ')[0]
  const pillColor = ProposalGrantCategoryColor[configuration.category as ProposalGrantCategory]
  const handleClick = useCallback(() => navigate(locations.proposal(id)), [id])

  return (
    <Table.Row
      className="GrantsPastItem__Row"
      key={id}
      onClick={handleClick}
      role="button"
      aria-label={t('page.grants.current_banner.title', { title: grant.title })}
    >
      <Table.Cell className="GrantsPastItem__Cell GrantsPastItem__FirstCell">{title}</Table.Cell>
      <Table.Cell className="GrantsPastItem__Cell">
        <Pill color={pillColor}>{category}</Pill>
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
