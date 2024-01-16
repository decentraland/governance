import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import WiderContainer from '../components/Common/WiderContainer'
import ActiveCommunityGrants from '../components/Home/ActiveCommunityGrants'
import ActivityTicker from '../components/Home/ActivityTicker'
import BottomBanner from '../components/Home/BottomBanner/BottomBanner'
import CommunityEngagement from '../components/Home/CommunityEngagement'
import DaoDelegates from '../components/Home/DaoDelegates'
import MainBanner from '../components/Home/MainBanner'
import MetricsCards from '../components/Home/MetricsCards'
import OpenProposals from '../components/Home/OpenProposals'
import UpcomingOpportunities from '../components/Home/UpcomingOpportunities'
import { Desktop1200 } from '../components/Layout/Desktop1200'
import Head from '../components/Layout/Head'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { ProposalStatus, SortingOrder } from '../entities/Proposal/types'
import useFormatMessage from '../hooks/useFormatMessage'
import useProposals from '../hooks/useProposals'
import { isUnderMaintenance } from '../utils/maintenance'

import './index.css'

export default function HomePage() {
  const t = useFormatMessage()

  const { proposals: endingSoonProposals, isLoadingProposals } = useProposals({
    order: SortingOrder.ASC,
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
      <Head title={t('page.home.title')} description={t('page.home.description')} />
      <Navigation activeTab={NavigationTab.Home} />
      {!endingSoonProposals && <LoadingView withNavigation />}
      {endingSoonProposals && (
        <WiderContainer>
          <div className="HomePage__Container">
            <div className="HomePage__Content">
              <MainBanner />
              <MetricsCards />
              {isLoadingProposals && <Loader active />}
              {!isLoadingProposals && (
                <>
                  <OpenProposals
                    endingSoonProposals={endingSoonProposals?.data}
                    isLoadingProposals={isLoadingProposals}
                  />
                  <UpcomingOpportunities />
                  <ActiveCommunityGrants />
                  <DaoDelegates />
                  <CommunityEngagement />
                  <BottomBanner />
                </>
              )}
            </div>
            <Desktop1200>
              <ActivityTicker />
            </Desktop1200>
          </div>
        </WiderContainer>
      )}
    </>
  )
}
