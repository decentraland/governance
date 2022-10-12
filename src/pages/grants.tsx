import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Mobile } from 'decentraland-ui/dist/components/Media/Media'
import { isEmpty } from 'lodash'

import CurrentGrantsList from '../components/Grants/Current/CurrentGrantsList'
import PastGrantsList from '../components/Grants/Past/PastGrantsList'
import BurgerMenuContent from '../components/Layout/BurgerMenu/BurgerMenuContent'
import BurgerMenuPushableLayout from '../components/Layout/BurgerMenu/BurgerMenuPushableLayout'
import LoadingView from '../components/Layout/LoadingView'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import useGrants from '../hooks/useGrants'
import { isUnderMaintenance } from '../modules/maintenance'

export default function GrantsPage() {
  const t = useFormatMessage()
  const { grants, isLoadingGrants } = useGrants()
  const isLoading = isEmpty(grants) && isLoadingGrants

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
        <>
          <Mobile>
            <BurgerMenuContent className="Padded" navigationOnly activeTab={NavigationTab.Grants} />
          </Mobile>
          <BurgerMenuPushableLayout>
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
          </BurgerMenuPushableLayout>
        </>
      )}
    </div>
  )
}
