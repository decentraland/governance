import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import useTopVoters from '../../hooks/useTopVoters'

import TopVoterRow from './TopVoterRow'

const createRow = ({ address, votes }: { address: string; votes: number }, idx: number) => {
  return <TopVoterRow key={idx} address={address} votes={votes} />
}

const now = new Date()
const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDay())

function TopVoters() {
  const t = useFormatMessage()
  const { topVoters } = useTopVoters(start, now, 5)
  return (
    <Card className="TopVoters">
      <Table basic="very">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t('page.home.community_engagement.top_voters')}</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">{t('page.home.community_engagement.Votes')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{topVoters.map(createRow)}</Table.Body>
      </Table>
    </Card>
  )
}

export default TopVoters
