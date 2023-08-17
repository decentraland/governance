import React, { useMemo } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { NotMobile } from 'decentraland-ui/dist/components/Media/Media'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import WiderContainer from '../components/Common/WiderContainer'
import CurrentGrantsBanner from '../components/Grants/Current/CurrentGrantsBanner'
import CurrentGrantsList from '../components/Grants/Current/CurrentGrantsList'
import RequestBanner from '../components/Grants/RequestBanner'
import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import CategoryFilter, { ProjectCategoryFilter } from '../components/Search/CategoryFilter'
import StatusFilter from '../components/Search/StatusFilter'
import { ProjectStatus, toGrantSubtype } from '../entities/Grant/types'
import { toProjectStatus } from '../entities/Grant/utils'
import { GrantWithUpdate, ProposalType } from '../entities/Proposal/types'
import useFormatMessage from '../hooks/useFormatMessage'
import useProjects from '../hooks/useProjects'
import useURLSearchParams from '../hooks/useURLSearchParams'
import { isUnderMaintenance } from '../utils/maintenance'

function getCounter(allGrants: GrantWithUpdate[] | undefined) {
  return {
    all_projects: allGrants?.length || 0,
    all_grants: allGrants?.length || 0,
    bidding_and_tendering: allGrants?.filter((item) => item.type === ProposalType.Bid).length || 0,
    grants: allGrants?.filter((item) => item.type === ProposalType.Grant).length || 0,
    accelerator: 100, // TODO: Get counter for all grant categories
  }
}

function getQueryType(type: string | null) {
  if (type === ProjectCategoryFilter.BiddingAndTendering) {
    return ProposalType.Bid
  }

  if (type === ProjectCategoryFilter.Grants) {
    return ProposalType.Grant
  }

  return `bid,grant`
}

export default function ProjectsPage() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const type = params.get('type')
  const status = toProjectStatus(params.get('status'))
  const subtype = toGrantSubtype(params.get('subtype'))
  const { projects, isLoadingProjects } = useProjects({
    type: getQueryType(type),
    subtype,
    status,
  })

  const counter = useMemo(() => getCounter(projects?.data), [projects?.data])

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
    <>
      <Head
        title={t('page.grants.title') || ''}
        description={t('page.grants.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Grants} />
      {isLoadingProjects && <LoadingView withNavigation />}
      {!isLoadingProjects && (
        <BurgerMenuLayout navigationOnly activeTab={NavigationTab.Grants}>
          <WiderContainer>
            <CurrentGrantsBanner />
            <Grid stackable>
              <Grid.Row>
                <Grid.Column tablet="3">
                  <NotMobile>
                    <CategoryFilter filterType={ProjectCategoryFilter} categoryCount={counter} startOpen />
                    <StatusFilter statusType={ProjectStatus} startOpen />
                    <RequestBanner />
                  </NotMobile>
                </Grid.Column>
                <Grid.Column tablet="13">
                  {projects?.data && (
                    <CurrentGrantsList
                      grants={projects.data}
                      selectedType={type}
                      selectedSubtype={subtype}
                      status={toProjectStatus(status)}
                      counter={counter}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </WiderContainer>
        </BurgerMenuLayout>
      )}
    </>
  )
}
