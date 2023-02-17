import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { NotMobile } from 'decentraland-ui/dist/components/Media/Media'
import isEmpty from 'lodash/isEmpty'
import toSnakeCase from 'lodash/snakeCase'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import CurrentGrantsBanner from '../components/Grants/Current/CurrentGrantsBanner'
import CurrentGrantsList from '../components/Grants/Current/CurrentGrantsList'
import RequestBanner from '../components/Grants/RequestBanner'
import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import CategoryFilter, { Counter, FilterType } from '../components/Search/CategoryFilter'
import StatusFilter from '../components/Search/StatusFilter'
import { GrantStatus, NewGrantCategory, OldGrantCategory } from '../entities/Grant/types'
import { toGrantStatus, toProposalGrantCategory } from '../entities/Grant/utils'
import { GrantWithUpdate } from '../entities/Proposal/types'
import useGrants from '../hooks/useGrants'
import { isUnderMaintenance } from '../modules/maintenance'

function filterDisplayableGrants(grants: GrantWithUpdate[], type: string | null, status: string | null) {
  return status || type
    ? grants.filter(
        (grant) =>
          (type ? toSnakeCase(grant.configuration.category) === toSnakeCase(type) : true) &&
          (status ? toSnakeCase(grant.status) === toSnakeCase(status) : true)
      )
    : grants
}

function getCounter(allGrants: GrantWithUpdate[], filterType: FilterType, status: string | null) {
  if (isEmpty(allGrants)) {
    return undefined
  }

  const counter = {} as Record<string, number>
  for (const filter of Object.values(filterType)) {
    const grants = filterDisplayableGrants(allGrants, filter, status)
    counter[filter] = grants.length
  }

  return counter as Counter
}

export default function GrantsPage() {
  const t = useFormatMessage()
  const { grants, isLoadingGrants } = useGrants()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const isLoading = isEmpty(grants) && isLoadingGrants
  const type = params.get('type')
  const status = params.get('status')

  const allGrants = useMemo(() => [...grants.current, ...grants.past], [grants])
  const displayableGrants = useMemo(() => filterDisplayableGrants(allGrants, type, status), [allGrants, type, status])

  const newGrantsCounter = useMemo(() => getCounter(allGrants, NewGrantCategory, status), [allGrants, status])
  const oldGrantsCounter = useMemo(() => getCounter(allGrants, OldGrantCategory, status), [allGrants, status])

  if (isUnderMaintenance()) {
    return (
      <MaintenanceLayout
        title={t('page.grants.title')}
        description={t('page.grants.description')}
        activeTab={NavigationTab.Grants}
      />
    )
  }

  return (
    <div>
      <Head
        title={t('page.grants.title') || ''}
        description={t('page.grants.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Grants} />
      {isLoading && <LoadingView withNavigation />}
      {!isLoading && (
        <BurgerMenuLayout navigationOnly activeTab={NavigationTab.Grants}>
          <Container>
            <Grid stackable>
              <Grid.Row>
                <CurrentGrantsBanner />
              </Grid.Row>
              <Grid.Row>
                <Grid.Column tablet="4">
                  <NotMobile>
                    <CategoryFilter filterType={NewGrantCategory} categoryCount={newGrantsCounter} startOpen />
                    <CategoryFilter filterType={OldGrantCategory} categoryCount={oldGrantsCounter} />
                    <StatusFilter statusType={GrantStatus} startOpen />
                    <RequestBanner />
                  </NotMobile>
                </Grid.Column>
                <Grid.Column tablet="12">
                  <CurrentGrantsList
                    grants={displayableGrants}
                    category={toProposalGrantCategory(type)}
                    status={toGrantStatus(status)}
                    counter={
                      newGrantsCounter && oldGrantsCounter
                        ? { ...newGrantsCounter, ...oldGrantsCounter }
                        : newGrantsCounter || oldGrantsCounter
                    }
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>
        </BurgerMenuLayout>
      )}
    </div>
  )
}
