import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Table } from 'decentraland-ui/dist/components/Table/Table'

import { VOTES_VP_THRESHOLD } from '../../constants'
import useFormatMessage from '../../hooks/useFormatMessage'
import useTopVoters from '../../hooks/useTopVoters'
import Helper from '../Helper/Helper'

import HomeLoader from './HomeLoader'
import './TopVoters.css'
import TopVotersRow from './TopVotersRow'

const createRow = ({ address, votes }: { address: string; votes: number }, idx: number) => {
  return <TopVotersRow key={idx} address={address} votes={votes} rank={idx + 1} />
}

function TopVoters() {
  const t = useFormatMessage()
  const { topVoters, isLoadingTopVoters } = useTopVoters()

  return (
    <Card className="TopVoters">
      <Table basic="very" unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell className="TopVoters__HeaderTitle">
              <Header sub>{t('page.home.community_engagement.top_voters')}</Header>
              <Helper
                text={t('page.home.community_engagement.top_voters_tooltip', { vp: VOTES_VP_THRESHOLD })}
                position={'top center'}
                size={'14'}
              />
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="center">
              <Header sub>{t('page.home.community_engagement.votes')}</Header>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {!isLoadingTopVoters && <Table.Body>{topVoters.map(createRow)}</Table.Body>}
        {isLoadingTopVoters && (
          <Table.Body>
            <Table.Row className="TopVoters__Loader">
              <Table.Cell>
                <HomeLoader>{t('page.home.community_engagement.fetching_votes')}</HomeLoader>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        )}
      </Table>
    </Card>
  )
}

export default TopVoters
