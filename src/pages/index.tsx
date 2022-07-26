import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import ActiveCommunityGrants from '../components/Home/ActiveCommunityGrants'
import MainBanner from '../components/Home/MainBanner'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { isUnderMaintenance } from '../modules/maintenance'

export default function HomePage() {
  const t = useFormatMessage()

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.home.title')}
          description={t('page.home.description')}
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Home} />
        <MaintenancePage />
      </>
    )
  }

  return (
    <>
      <Head
        title={t('page.home.title')}
        description={t('page.home.description')}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Home} />
      <Container>
        <MainBanner />
      </Container>
      <ActiveCommunityGrants />
    </>
  )
}
