import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import isEmpty from 'lodash/isEmpty'

import CurrentGrantsList from '../components/Grants/Current/CurrentGrantsList'
import PastGrantsList from '../components/Grants/Past/PastGrantsList'
import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import useGrants from '../hooks/useGrants'
import { isUnderMaintenance } from '../modules/maintenance'

export default function GrantsPage() {
  const t = useFormatMessage()
  const { grants, isLoadingGrants } = useGrants()
  const isLoading = isEmpty(grants) && isLoadingGrants

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
            {!isEmpty(grants.current) && <CurrentGrantsList grants={grants.current} />}
            {!isEmpty(grants.past) && (
              <PastGrantsList
                grants={grants.past}
                currentGrantsTotal={grants.current.length}
                totalGrants={grants.total}
              />
            )}
          </Container>
        </BurgerMenuLayout>
      )}
    </div>
  )
}
