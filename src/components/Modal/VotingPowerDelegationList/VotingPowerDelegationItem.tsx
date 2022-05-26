import React, { useState } from 'react'

import { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { Delegate } from '../../../hooks/useDelegatesInfo'
import Arrow from '../../Icon/Arrow'
import Username from '../../User/Username'

import './VotingPowerDelegationItem.css'

type VotingPowerDelegationItemProps = {
  delegate: Delegate
  onClick: () => void
}

function VotingPowerDelegationItem({ delegate, onClick }: VotingPowerDelegationItemProps) {
  const intl = useIntl()
  const [isFilled, setIsFilled] = useState(false)

  return (
    <Table.Row onMouseEnter={() => setIsFilled(true)} onMouseLeave={() => setIsFilled(false)} onClick={onClick}>
      <Table.Cell>
        <Username
          address={delegate.address}
          size="small"
          className="VotingPowerDelegationItem__Username"
        />
      </Table.Cell>
      <Table.Cell>{intl.formatNumber(delegate.pickedBy)}</Table.Cell>
      <Table.Cell>{intl.formatNumber(delegate.totalVP)}</Table.Cell>
      <Table.Cell>
        <Arrow filled={isFilled} />
      </Table.Cell>
    </Table.Row>
  )
}

export default React.memo(VotingPowerDelegationItem)
