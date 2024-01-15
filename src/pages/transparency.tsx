import { useMemo } from 'react'

import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import Head from '../components/Common/Head'
import Heading from '../components/Common/Typography/Heading'
import WiderContainer from '../components/Common/WiderContainer'
import ChartBar from '../components/Icon/ChartBar'
import Database from '../components/Icon/Database'
import Discord from '../components/Icon/Discord'
import Document from '../components/Icon/Document'
import DocumentOutline from '../components/Icon/DocumentOutline'
import OpenFolder from '../components/Icon/OpenFolder'
import Person from '../components/Icon/Person'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import TokenBalanceCard from '../components/Token/TokenBalanceCard'
import CoreUnitsSection from '../components/Transparency/CoreUnitsSection'
import GrantList from '../components/Transparency/GrantList'
import MembersSection from '../components/Transparency/MembersSection'
import MonthlyTotal from '../components/Transparency/MonthlyTotal'
import Sidebar from '../components/Transparency/Sidebar'
import { DOCS_URL, OPEN_CALL_FOR_DELEGATES_LINK } from '../constants'
import { ProposalStatus } from '../entities/Proposal/types'
import { JOIN_DISCORD_URL, formatBalance } from '../entities/Proposal/utils'
import { aggregateBalances } from '../entities/Transparency/utils'
import useCoreUnitsBadges from '../hooks/useCoreUnitsBadges'
import useFormatMessage from '../hooks/useFormatMessage'
import useTransparency from '../hooks/useTransparency'
import locations from '../utils/locations'

import './transparency.css'

const DASHBOARD_URL =
  'https://datastudio.google.com/u/3/reporting/fca13118-c18d-4e68-9582-ad46d2dd5ce9/page/p_n06szvxkrc'
const DATA_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1FoV7TdMTVnqVOZoV4bvVdHWkeu4sMH5JEhp8L0Shjlo/edit'
const ABOUT_DAO_URL = 'https://docs.decentraland.org/decentraland/how-does-the-dao-work/'
const WEARABLE_CURATORS_URL = 'https://forum.decentraland.org/t/wearables-curation-committee-member-nominations/2047'

export default function TransparencyPage() {
  const t = useFormatMessage()
  const { data } = useTransparency()
  const balances = useMemo(() => (data && aggregateBalances(data.balances)) || [], [data])
  const { coreUnitsBadges } = useCoreUnitsBadges()

  return (
    <>
      <Navigation activeTab={NavigationTab.Transparency} />
      <Head
        title={t('page.transparency.title')}
        description={t('page.transparency.mission.description')}
        image="https://decentraland.org/images/decentraland.png"
        link={[{ rel: 'canonical', href: locations.transparency() }]}
      />
      <div className="TransparencyPage">
        {!data && <LoadingView withNavigation />}
        {data && (
          <WiderContainer>
            <div className="TransparencyGrid">
              <Sidebar
                title={t('page.transparency.mission.title')}
                description={t('page.transparency.mission.description')}
                buttons={[
                  {
                    href: JOIN_DISCORD_URL,
                    icon: <Discord color="var(--black-800)" size={20} />,
                    children: t('page.transparency.mission.join_discord_button'),
                  },
                  {
                    href: DOCS_URL,
                    icon: <Document size={20} />,
                    children: t('page.transparency.mission.docs_button'),
                  },
                  {
                    href: DASHBOARD_URL,
                    icon: <ChartBar size={20} />,
                    children: t('page.transparency.mission.dashboard_button'),
                  },
                  {
                    href: DATA_SHEET_URL,
                    icon: <Database size={20} />,
                    children: t('page.transparency.mission.data_source_button'),
                  },
                ]}
              />
              <div>
                <div className="Transparency__Section Transparency__BalanceCard">
                  <Card className="Transparency__Card">
                    <Card.Content>
                      <Heading size="sm" weight="semi-bold">
                        {t('page.transparency.mission.balance_title')}
                      </Heading>
                      <div className="Transparecy__TokenContainer">
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
                <div className="Transparency__MonthlyTotals">
                  <MonthlyTotal
                    title={t('page.transparency.mission.monthly_income') || ''}
                    monthlyTotal={data.income}
                  />
                  <MonthlyTotal
                    title={t('page.transparency.mission.monthly_expenses') || ''}
                    monthlyTotal={data.expenses}
                    invertDiffColors={true}
                  />
                </div>
              </div>
            </div>

            <div className="TransparencyGrid">
              <Sidebar
                title={t('page.transparency.funding.title')}
                description={t('page.transparency.funding.description')}
                buttons={[
                  {
                    href: locations.proposals(),
                    icon: <OpenFolder size={20} />,
                    isExternal: false,
                    children: t('page.transparency.funding.view_all_button'),
                  },
                ]}
              />

              <div className="Transparency__Section">
                <Card className="Transparency__Card">
                  <Card.Content>
                    <Heading size="sm" weight="normal">
                      {t('page.transparency.funding.total_title')}
                    </Heading>
                    <div className="Transparency__FundingProgress">
                      <div className="Transparency__FundingProgressDescription">
                        <Header size="huge" className="Transparency__FundingProgressTotal">
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
            </div>

            <div className="TransparencyGrid">
              <Sidebar
                title={t('page.transparency.members.title')}
                description={t('page.transparency.members.description')}
                buttons={[
                  {
                    href: ABOUT_DAO_URL,
                    icon: <DocumentOutline size={20} />,
                    children: t('page.transparency.members.about_dao_button'),
                  },
                  {
                    href: WEARABLE_CURATORS_URL,
                    icon: <Person size={20} />,
                    children: t('page.transparency.members.wearables_curator_button'),
                  },
                  {
                    href: OPEN_CALL_FOR_DELEGATES_LINK,
                    icon: <Person size={20} />,
                    children: t('page.transparency.members.delegate_button'),
                  },
                ]}
              />

              <div className="Transparency__Section">
                <Card className="Transparency__Card">
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
            </div>

            {coreUnitsBadges && (
              <div className="TransparencyGrid">
                <Sidebar
                  title={t('page.transparency.core_units.title')}
                  description={t('page.transparency.core_units.description')}
                />
                <div className="Transparency__Section">
                  <Card className="Transparency__Card">
                    <CoreUnitsSection coreUnitsBadges={coreUnitsBadges} />
                  </Card>
                </div>
              </div>
            )}
          </WiderContainer>
        )}
      </div>
    </>
  )
}
