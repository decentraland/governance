import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import Username from '../Common/Username'

interface Props {
  address: string
  votes: number
  rank: number
}

function TopVotersRow({ address, votes, rank }: Props) {
  return (
    <Table.Row>
      <Table.Cell>
        <span className="TopVotersRow__User">
          <Header sub>{rank}</Header>
          <Username address={address} size="sm" linked />
        </span>
      </Table.Cell>
      <Table.Cell textAlign="center">{votes}</Table.Cell>
    </Table.Row>
  )
}

export default TopVotersRow
