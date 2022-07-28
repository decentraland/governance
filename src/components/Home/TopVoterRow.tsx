import React from 'react'

import { Table } from 'decentraland-ui/dist/components/Table/Table'

import Username from '../User/Username'

interface Props {
  address: string
  votes: number
}

function TopVoterRow({ address, votes }: Props) {
  return (
    <Table.Row>
      <Table.Cell>
        <Username address={address} size="small" className="TopVoterRow__Username" />
      </Table.Cell>
      <Table.Cell>{votes}</Table.Cell>
    </Table.Row>
  )
}

export default TopVoterRow
