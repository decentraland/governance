import React, { useMemo } from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import ExternalLinkWithIcon from '../components/Section/ExternalLinkWithIcon'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import TokenBalanceCard from '../components/Token/TokenBalanceCard'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { JOIN_DISCORD_URL, formatBalance } from '../entities/Proposal/utils'
import { DclData } from '../api/DclData'
import { aggregateBalances } from '../entities/Transparency/utils'
import locations from '../modules/locations'
import LinkWithIcon from '../components/Section/LinkWithIcon'
import Progress from '../components/Status/Progress'
import { ProposalStatus } from '../entities/Proposal/types';
import './transparency.css'
import GrantList from '../components/Transparency/GrantList'
import MonthlyTotal from '../components/Transparency/MonthlyTotal'
import MembersSection from '../components/Transparency/MembersSection'

const DOCS_URL = 'https://docs.decentraland.org/decentraland/what-is-the-dao/'
const DATA_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1FoV7TdMTVnqVOZoV4bvVdHWkeu4sMH5JEhp8L0Shjlo/edit'
const ORGANIZATIONAL_CHART_URL = 'https://docs.google.com/drawings/d/1Ks2lyplFqwlMS8-D0L1YeNJT6LIB_qVJgkbn298cS4o/edit'
const docsIcon = require('../images/icons/docs.svg')
const discordIcon = require('../images/icons/discord.svg')
const openFolder = require('../images/icons/open-folder.svg')
const documentOutline = require('../images/icons/document-outline.svg')
const organizationalChart = require('../images/icons/organizational-chart.svg')
const database = require('../images/icons/database.svg')


export default function WrappingPage() {
  const l = useFormatMessage()
  const [data] = useAsyncMemo(async () => DclData.get().getData())
  const balances = useMemo(() => data && aggregateBalances(data.balances) || [], [data])
  const fundingProgress = useMemo(() => data && Number(BigInt(data.funding.total) * BigInt(100) / BigInt(data.funding.budget)) || 0, [data])

  return (<>
    {!data && <Loader active />}
    {data && <>
      <Head
        title={l('page.transparency.mission.title') || ''}
        description={l('page.transparency.mission.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Transparency} />
      <Container className="TransparencyContainer">
        <Grid stackable>
          <Grid.Row columns={2}>
            <Grid.Column tablet="4">
              <div>
                <Header>{l('page.transparency.mission.title')}</Header>
                <p>{l('page.transparency.mission.description')}</p>
                <ExternalLinkWithIcon href={JOIN_DISCORD_URL}
                                      imageSrc={discordIcon}
                                      text={l('page.transparency.mission.join_discord_button')} />
                <ExternalLinkWithIcon href={DOCS_URL}
                                      imageSrc={docsIcon}
                                      text={l('page.transparency.mission.docs_button')} />
                <ExternalLinkWithIcon href={DATA_SHEET_URL}
                                      imageSrc={database}
                                      text={l('page.transparency.mission.data_source_button')} />
              </div>
            </Grid.Column>

            <Grid.Column tablet="12">
              <div className="TransparencySection">
                <Card className="TransparencyCard">
                  <Card.Content>
                    <Header>{l('page.transparency.mission.balance_title')}</Header>
                    <div className="TokenContainer">
                      {balances && balances.map((tokenBalance, index) => {
                        return <TokenBalanceCard aggregatedTokenBalance={tokenBalance}
                                                 key={['tokenBalance', index].join('::')} />
                      })}
                    </div>
                  </Card.Content>
                </Card>
              </div>
              <Grid.Row columns={2} divided={true} className="MonthlyTotals">
                <MonthlyTotal title={l('page.transparency.mission.monthly_income') || ''} monthlyTotal={data.income} />
                <MonthlyTotal title={l('page.transparency.mission.monthly_expenses') || ''} monthlyTotal={data.expenses} />
              </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>

      <Container>
        <Grid stackable>
          <Grid.Row columns={2}>
            <Grid.Column tablet="4">
              <div>
                <Header>{l('page.transparency.funding.title')}</Header>
                <p>{l('page.transparency.funding.description')}</p>
                <LinkWithIcon href={locations.proposals()}
                              imageSrc={openFolder}
                              text={l('page.transparency.funding.view_all_button')} />
              </div>
            </Grid.Column>

            <Grid.Column tablet="12">
              <div className="TransparencySection">
                <Card className="TransparencyCard">
                  <Card.Content>
                    <Header>{l('page.transparency.funding.total_title')}</Header>
                    <div className="FundingProgress">
                      <div className="FundingProgress__Description">
                        <Header size="huge" className="FundingProgress__Total">
                          {'$' + formatBalance(data.funding.total)}
                          <Header size="small">USD</Header>
                        </Header>
                        <Header sub className="FundingProgress__Budget">
                          {l('page.transparency.funding.budget_label', {amount: formatBalance(data.funding.budget)})}
                        </Header>
                      </div>
                      <Progress color={'approve'} progress={fundingProgress} />
                    </div>
                  </Card.Content>
                  <GrantList
                    status={ProposalStatus.Enacted}
                    title={l('page.transparency.funding.proposals_funded_label') || ''}
                  />
                  <GrantList
                    status={ProposalStatus.Active}
                    title={l('page.transparency.funding.active_grants_label') || ''}
                  />
                </Card>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>

      <Container>
        <Grid stackable>
          <Grid.Row columns={2}>
            <Grid.Column tablet="4">
              <div>
                <Header>{l('page.transparency.members.title')}</Header>
                <p>{l('page.transparency.members.description')}</p>
                <LinkWithIcon href={locations.proposals()}
                              imageSrc={documentOutline}
                              text={l('page.transparency.members.review_contract_button')} />
                <ExternalLinkWithIcon href={ORGANIZATIONAL_CHART_URL}
                                      imageSrc={organizationalChart}
                                      text={l('page.transparency.members.organizational_chart_button')} />
              </div>
            </Grid.Column>

            <Grid.Column tablet="12">
              <div className="TransparencySection">
                <Card className="TransparencyCard">
                    <MembersSection
                      title={'DAO Committee'}
                      description={'Their principal responsibility is to enact binding proposals on-chain like listing Point of Interests, sending Grants, and any other operations involving the DAO\'s smart contracts.'}
                      members={data.members.filter(member => member.team == "DAO Committee")}
                    />
                </Card>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </>}
  </>)
}
