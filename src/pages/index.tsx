import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import ActiveCommunityGrants from '../components/Home/ActiveCommunityGrants'
import BottomBanner from '../components/Home/BottomBanner/BottomBanner'
import CommunityEngagement from '../components/Home/CommunityEngagement'
import DaoDelegates from '../components/Home/DaoDelegates'
import MainBanner from '../components/Home/MainBanner'
import MetricsCards from '../components/Home/MetricsCards'
import OpenProposals from '../components/Home/OpenProposals'
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
      <MetricsCards />
      <Container>
        <OpenProposals />
        <ActiveCommunityGrants />
        <DaoDelegates />
        <CommunityEngagement />
        <BottomBanner />
      </Container>
    </>
  )
}
