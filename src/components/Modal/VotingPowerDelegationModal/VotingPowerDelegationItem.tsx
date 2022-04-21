import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import React from 'react'

import useProfile from '../../../hooks/useProfile'
import Arrow from '../../Icon/Arrow'
import { Delegate } from './VotingPowerDelegationModal'

type VotingPowerDelegationItemProps = {
  delegate: Delegate
  picked_by: number
  arrowFilled: boolean
}

function VotingPowerDelegationItem({ delegate, picked_by, arrowFilled }: VotingPowerDelegationItemProps) {
  const intl = useIntl()
  const { profile } = useProfile(delegate.address)
  return (
    <>
      <Table.Cell>
        <span className="Candidate">
          <Avatar address={delegate.address} size="small" />
          {profile?.name || <Address value={delegate.address} />}
        </span>
      </Table.Cell>
      <Table.Cell>{intl.formatNumber(picked_by)}</Table.Cell>
      <Table.Cell>{intl.formatNumber(delegate.total_vp)}</Table.Cell>
      <Table.Cell>
        <Arrow filled={arrowFilled} />
      </Table.Cell>
    </>
  )
}

export default React.memo(VotingPowerDelegationItem)
