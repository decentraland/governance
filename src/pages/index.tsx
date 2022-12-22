import React, { useEffect, useState } from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import ActiveCommunityGrants from '../components/Home/ActiveCommunityGrants'
import BottomBanner from '../components/Home/BottomBanner/BottomBanner'
import CommunityEngagement from '../components/Home/CommunityEngagement'
import DaoDelegates from '../components/Home/DaoDelegates'
import MainBanner from '../components/Home/MainBanner'
import MetricsCards from '../components/Home/MetricsCards'
import OpenProposals from '../components/Home/OpenProposals'
import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { isUnderMaintenance } from '../modules/maintenance'

import './index.css'

const HIDE_HOME_BANNER_KEY = 'org.decentraland.governance.home_banner.hide'

const shouldShowMainBanner = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(HIDE_HOME_BANNER_KEY) !== 'true'
  }
}

export default function HomePage() {
  const t = useFormatMessage()
  const [showMainBanner, setShowMainBanner] = useState(false)

  useEffect(() => {
    setShowMainBanner(!!shouldShowMainBanner())
  }, [])

  if (isUnderMaintenance()) {
    return (
      <MaintenanceLayout
        title={t('page.home.title')}
        description={t('page.home.description')}
        activeTab={NavigationTab.Home}
      />
    )
  }

  const handleCloseMainBannerClick = () => {
    localStorage.setItem(HIDE_HOME_BANNER_KEY, 'true')
    setShowMainBanner(false)
  }

  return (
    <>
      <Head
        title={t('page.home.title')}
        description={t('page.home.description')}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Home} />
      <BurgerMenuLayout navigationOnly activeTab={NavigationTab.Home}>
        {showMainBanner && (
          <Container>
            <MainBanner onCloseClick={handleCloseMainBannerClick} />
          </Container>
        )}
        <MetricsCards />
        <Container>
          <OpenProposals />
          <ActiveCommunityGrants />
          <DaoDelegates />
          <CommunityEngagement />
          <BottomBanner />
        </Container>
      </BurgerMenuLayout>
    </>
  )
}
