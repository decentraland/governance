import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import ActiveCommunityGrants from '../components/Home/ActiveCommunityGrants'
import BottomBanner from '../components/Home/BottomBanner/BottomBanner'
import CommunityEngagement from '../components/Home/CommunityEngagement'
import DaoDelegates from '../components/Home/DaoDelegates'
import MainBanner from '../components/Home/MainBanner'
import MetricsCards from '../components/Home/MetricsCards'
import OpenProposals from '../components/Home/OpenProposals'
import BurgerMenuLayout from '../components/Layout/BurgerMenu/BurgerMenuLayout'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { ProposalStatus } from '../entities/Proposal/types'
import useProposals from '../hooks/useProposals'
import { isUnderMaintenance } from '../modules/maintenance'

import './index.css'

export default function HomePage() {
  const t = useFormatMessage()

  const { proposals: endingSoonProposals, isLoadingProposals } = useProposals({
    order: 'ASC',
    status: ProposalStatus.Active,
    timeFrameKey: 'finish_at',
    page: 1,
    itemsPerPage: 5,
  })

  if (isUnderMaintenance()) {
    return (
      <MaintenanceLayout
        title={t('page.home.title')}
        description={t('page.home.description')}
        activeTab={NavigationTab.Home}
      />
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
      {!endingSoonProposals && <LoadingView withNavigation />}
      {endingSoonProposals && (
        <BurgerMenuLayout navigationOnly activeTab={NavigationTab.Home}>
          <Container>
            <MainBanner />
          </Container>
          <MetricsCards />
          <Container>
            {isLoadingProposals && <Loader active />}
            {!isLoadingProposals && (
              <>
                <OpenProposals
                  endingSoonProposals={endingSoonProposals?.data}
                  isLoadingProposals={isLoadingProposals}
                />
                <ActiveCommunityGrants />
                <DaoDelegates />
                <CommunityEngagement />
                <BottomBanner />
              </>
            )}
          </Container>
        </BurgerMenuLayout>
      )}
    </>
  )
}
