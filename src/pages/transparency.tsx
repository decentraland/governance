import React, { useMemo } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Mobile } from 'decentraland-ui/dist/components/Media/Media'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import BurgerMenuContent from '../components/Layout/BurgerMenu/BurgerMenuContent'
import BurgerMenuPushableLayout from '../components/Layout/BurgerMenu/BurgerMenuPushableLayout'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import ExternalLinkWithIcon from '../components/Section/ExternalLinkWithIcon'
import LinkWithIcon from '../components/Section/LinkWithIcon'
import TokenBalanceCard from '../components/Token/TokenBalanceCard'
import GrantList from '../components/Transparency/GrantList'
import MembersSection from '../components/Transparency/MembersSection'
import MonthlyTotal from '../components/Transparency/MonthlyTotal'
import { DOCS_URL, OPEN_CALL_FOR_DELEGATES_LINK } from '../constants'
import { ProposalStatus } from '../entities/Proposal/types'
import { JOIN_DISCORD_URL, formatBalance } from '../entities/Proposal/utils'
import { aggregateBalances } from '../entities/Transparency/utils'
import useDclData from '../hooks/useDclData'
import locations from '../modules/locations'

import './transparency.css'

const discordIcon = require('../images/icons/discord.svg').default
const docsIcon = require('../images/icons/docs.svg').default
const dashboardIcon = require('../images/icons/chart-bar.svg').default
const dataSheetIcon = require('../images/icons/database.svg').default
const viewAllProposalsIcon = require('../images/icons/open-folder.svg').default
const documentOutline = require('../images/icons/document-outline.svg').default
const personIcon = require('../images/icons/person-icon.svg').default

const DASHBOARD_URL =
  'https://datastudio.google.com/u/3/reporting/fca13118-c18d-4e68-9582-ad46d2dd5ce9/page/p_n06szvxkrc'
const DATA_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1FoV7TdMTVnqVOZoV4bvVdHWkeu4sMH5JEhp8L0Shjlo/edit'
const ABOUT_DAO_URL = 'https://docs.decentraland.org/decentraland/how-does-the-dao-work/'
const WEARABLE_CURATORS_URL = 'https://forum.decentraland.org/t/wearables-curation-committee-member-nominations/2047'

export default function TransparencyPage() {
  const t = useFormatMessage()
  const [data] = useDclData()
  const balances = useMemo(() => (data && aggregateBalances(data.balances)) || [], [data])

  return (
    <>
      <Navigation activeTab={NavigationTab.Transparency} />
      <Head
        title={t('page.transparency.title') || ''}
        description={t('page.transparency.mission.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <div className="TransparencyMobile">
        {!data && <LoadingView withNavigation />}
        {data && (
          <>
            <Mobile>
              <BurgerMenuContent className="Padded" navigationOnly activeTab={NavigationTab.Transparency} />
            </Mobile>
            <BurgerMenuPushableLayout>
              <Container className="TransparencyContainer">
                <Grid className="TransparencyGrid" stackable>
                  <Grid.Row columns={2}>
                    <Grid.Column tablet="4">
                      <div>
                        <Header>{t('page.transparency.mission.title')}</Header>
                        <p>{t('page.transparency.mission.description')}</p>
                        <ExternalLinkWithIcon
                          href={JOIN_DISCORD_URL}
                          imageSrc={discordIcon}
                          text={t('page.transparency.mission.join_discord_button')}
                        />
                        <ExternalLinkWithIcon
                          href={DOCS_URL}
                          imageSrc={docsIcon}
                          text={t('page.transparency.mission.docs_button')}
                        />
                        <ExternalLinkWithIcon
                          href={DASHBOARD_URL}
                          imageSrc={dashboardIcon}
                          text={t('page.transparency.mission.dashboard_button')}
                        />
                        <ExternalLinkWithIcon
                          href={DATA_SHEET_URL}
                          imageSrc={dataSheetIcon}
                          text={t('page.transparency.mission.data_source_button')}
                        />
                      </div>
                    </Grid.Column>

                    <Grid.Column tablet="12">
                      <div className="TransparencySection">
                        <Card className="TransparencyCard">
                          <Card.Content>
                            <Header>{t('page.transparency.mission.balance_title')}</Header>
                            <div className="TokenContainer">
                              {balances &&
                                balances.map((tokenBalance, index) => {
                                  return (
                                    <TokenBalanceCard
                                      aggregatedTokenBalance={tokenBalance}
                                      key={['tokenBalance', index].join('::')}
                                    />
                                  )
                                })}
                            </div>
                          </Card.Content>
                        </Card>
                      </div>
                      <Grid.Row columns={2} divided={true} className="MonthlyTotals">
                        <MonthlyTotal
                          title={t('page.transparency.mission.monthly_income') || ''}
                          monthlyTotal={data.income}
                        />
                        <MonthlyTotal
                          title={t('page.transparency.mission.monthly_expenses') || ''}
                          monthlyTotal={data.expenses}
                          invertDiffColors={true}
                        />
                      </Grid.Row>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Container>

              <Container className="TransparencyContainer">
                <Grid className="TransparencyGrid Funding" stackable>
                  <Grid.Row columns={2}>
                    <Grid.Column tablet="4">
                      <div>
                        <Header>{t('page.transparency.funding.title')}</Header>
                        <p>{t('page.transparency.funding.description')}</p>
                        <LinkWithIcon
                          href={locations.proposals()}
                          imageSrc={viewAllProposalsIcon}
                          text={t('page.transparency.funding.view_all_button')}
                        />
                      </div>
                    </Grid.Column>

                    <Grid.Column tablet="12">
                      <div className="TransparencySection">
                        <Card className="TransparencyCard">
                          <Card.Content>
                            <Header className="FundingHeader">{t('page.transparency.funding.total_title')}</Header>
                            <div className="FundingProgress">
                              <div className="FundingProgress__Description">
                                <Header size="huge" className="FundingProgress__Total">
                                  {'$' + formatBalance(data.funding.total)}
                                  <Header size="small">USD</Header>
                                </Header>
                              </div>
                            </div>
                          </Card.Content>
                          <GrantList
                            status={ProposalStatus.Enacted}
                            title={t('page.transparency.funding.proposals_funded_label') || ''}
                          />
                          <GrantList
                            status={ProposalStatus.Active}
                            title={t('page.transparency.funding.active_grants_label') || ''}
                          />
                        </Card>
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Container>

              <Container className="TransparencyContainer">
                <Grid className="TransparencyGrid" stackable>
                  <Grid.Row columns={2}>
                    <Grid.Column tablet="4">
                      <div>
                        <Header>{t('page.transparency.members.title')}</Header>
                        <p>{t('page.transparency.members.description')}</p>

                        <ExternalLinkWithIcon
                          href={ABOUT_DAO_URL}
                          imageSrc={documentOutline}
                          text={t('page.transparency.members.about_dao_button')}
                        />
                        <ExternalLinkWithIcon
                          href={WEARABLE_CURATORS_URL}
                          imageSrc={personIcon}
                          text={t('page.transparency.members.wearables_curator_button')}
                        />
                        <ExternalLinkWithIcon
                          href={OPEN_CALL_FOR_DELEGATES_LINK}
                          imageSrc={personIcon}
                          text={t('page.transparency.members.delegate_button')}
                        />
                      </div>
                    </Grid.Column>

                    <Grid.Column tablet="12">
                      <div className="TransparencySection">
                        <Card className="TransparencyCard">
                          {data &&
                            data.committees.map((team, index) => {
                              return (
                                <MembersSection
                                  key={[team.name.trim(), index].join('::')}
                                  title={team.name}
                                  description={team.description}
                                  members={team.members}
                                />
                              )
                            })}
                        </Card>
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Container>
            </BurgerMenuPushableLayout>
          </>
        )}
      </div>
    </>
  )
}
