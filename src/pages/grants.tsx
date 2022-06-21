import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Table } from 'decentraland-ui/dist/components/Table/Table'
import { isEmpty } from 'lodash'

import Banner, { BannerType } from '../components/Grants/Banner'
import GrantCard from '../components/Grants/GrantCard'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import useGrants from '../hooks/useGrants'
import { isUnderMaintenance } from '../modules/maintenance'

import './grants.css'

export default function GrantsPage() {
  const t = useFormatMessage()

  const { grants, isLoadingGrants } = useGrants()

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.grants.title') || ''}
          description={t('page.grants.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Grants} />
        <MaintenancePage />
      </>
    )
  }

  if (isEmpty(grants) && isLoadingGrants) {
    return <LoadingView />
  }

  const getCurrentBannerItems = () => {
    return [
      { title: `${grants.current.length} projects open`, description: 'Initiatives currently being funded' },
      { title: '$2.5 million USD released', description: 'Funding so far, for current batch' },
      { title: '$1.3 million USD to go', description: 'To be released for current batch' },
    ]
  }

  const getPastBannerItems = () => {
    return [
      { title: `${grants.past.length} projects`, description: 'Initiatives successfully funded' },
      { title: '$4.5 million USD', description: 'Aggregated funding for past initiatives' },
      { title: '$1.3M per month', description: 'Avg. funding since Feb 2021' },
    ]
  }

  return (
    <div>
      <Head
        title={t('page.grants.title') || ''}
        description={t('page.grants.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Grants} />
      <Container>
        {!isEmpty(grants.current) && (
          <>
            <Banner
              type={BannerType.Current}
              title={t('page.grants.current_banner.title')}
              description={t('page.grants.current_banner.description')}
              items={getCurrentBannerItems()}
            />
            <div>
              <h2 className="GrantsCard__Title">{t('page.grants.currently_funded')}</h2>
              <Container className="GrantsCards__Container">
                {grants.current.map((grant) => (
                  <GrantCard
                    key={`CurrentGrantCard_${grant.id}`}
                    title={grant.title}
                    category={grant.configuration.category}
                    tier={grant.configuration.tier}
                    size={grant.configuration.size}
                    vesting={grant.contract}
                  />
                ))}
              </Container>
            </div>
          </>
        )}
        {!isEmpty(grants.past) && (
          <>
            <Banner
              type={BannerType.Past}
              title={t('page.grants.past_banner.title')}
              description={t('page.grants.past_banner.description')}
              items={getPastBannerItems()}
            />
            <Table basic="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('page.grants.past_funded.title')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('page.grants.past_funded.category')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('page.grants.past_funded.date')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('page.grants.past_funded.size')}</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {grants.past.map((grant) => (
                  <Table.Row key={grant.id} onClick={() => null}>
                    <Table.Cell>{grant.title}</Table.Cell>
                    <Table.Cell>{grant.configuration.category}</Table.Cell>
                    <Table.Cell>{Time(grant.start_at).format('MMMM DD, YYYY')}</Table.Cell>
                    <Table.Cell>{`$${grant.configuration.size} USD`}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </>
        )}
      </Container>
    </div>
  )
}
