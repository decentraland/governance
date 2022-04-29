import React, { useState } from 'react'

import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { Delegate } from '../../../hooks/useDelegatesInfo'
import useProfile from '../../../hooks/useProfile'
import Arrow from '../../Icon/Arrow'

type VotingPowerDelegationItemProps = {
  delegate: Delegate
  onClick: () => void
}

function VotingPowerDelegationItem({ delegate, onClick }: VotingPowerDelegationItemProps) {
  const intl = useIntl()
  const { profile } = useProfile(delegate.address)
  const [isFilled, setIsFilled] = useState(false)

  return (
    <Table.Row onMouseEnter={() => setIsFilled(true)} onMouseLeave={() => setIsFilled(false)} onClick={onClick}>
      <Table.Cell>
        <span className="Candidate">
          <Avatar address={delegate.address} size="small" />
          {profile?.name || <Address value={delegate.address} />}
        </span>
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
