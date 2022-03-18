import React, { useMemo, useEffect, useContext } from "react"
import { useLocation } from '@reach/router'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Pagination } from "decentraland-ui/dist/components/Pagination/Pagination"
import { navigate } from "gatsby-plugin-intl"
import Navigation, { NavigationTab } from "../components/Layout/Navigation"

import locations, { ProposalListView, toProposalListPage, toProposalListView } from "../modules/locations"
import ActionableLayout from "../components/Layout/ActionableLayout"
import { ProposalStatus, ProposalType, toProposalStatus, toProposalType } from "../entities/Proposal/types"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import StatusMenu from "../components/Status/StatusMenu"
import CategoryBanner from "../components/Category/CategoryBanner"
import ProposalItem from "../components/Proposal/ProposalItem"
import useSubscriptions from "../hooks/useSubscriptions"
import Empty from "../components/Proposal/Empty"
// import Carousel from "decentraland-gatsby/dist/components/Carousel/Carousel"
// import WelcomeItem from "../components/Welcome/WelcomeItem"
// import Markdown from "decentraland-gatsby/dist/components/Text/Markdown"
import Head from "decentraland-gatsby/dist/components/Head/Head"
import Link from "decentraland-gatsby/dist/components/Text/Link"
import prevent from "decentraland-gatsby/dist/utils/react/prevent"
import useProposals from "../hooks/useProposals"
// import useFeatureFlagContext from "decentraland-gatsby/dist/context/FeatureFlag/useFeatureFlagContext"
// import { FeatureFlags } from "../modules/features"
import SubscriptionBanner from '../components/Subscription/SubscriptionBanner'
import { Governance } from "../api/Governance"
import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'
import CategoryList from "../components/Category/CategoryList"
import BurgerMenuContent from "../components/Layout/BurgerMenuContent"
import { BurgerMenuStatusContext } from '../components/Context/BurgerMenuStatusContext'
import { BurgerMenuShowContext } from "../components/Context/BurgerMenuShowContext"
import './index.css'
import { isUnderMaintenance } from "../modules/maintenance"
import MaintenancePage from "decentraland-gatsby/dist/components/Layout/MaintenancePage"
import MobileNavigation from "../components/Layout/MobileNavigation"
import { useBurgerMenu } from "../hooks/useBurgerMenu"

const ITEMS_PER_PAGE = 25

enum Onboarding {
  Loading,
  Yes,
  No
}

export default function IndexPage() {
  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const type = toProposalType(params.get('type')) ?? undefined
  const view = toProposalListView(params.get('view')) ?? undefined
  const status = view ? ProposalStatus.Enacted : toProposalStatus(params.get('status')) ?? undefined
  const page = toProposalListPage(params.get('page')) ?? undefined
  const [ proposals, proposalsState ] = useProposals({ type, status, page, itemsPerPage: ITEMS_PER_PAGE })
  const [ votes ] = useAsyncMemo(() => Governance.get()
    .getVotes((proposals?.data || []).map(proposal => proposal.id)),
    [ proposals ],
    { callWithTruthyDeps: true }
  )
  const [ subscriptions, subscriptionsState ] = useSubscriptions()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const burgerMenu = useBurgerMenu();
  const translate = '550px'

  // const [ ff ] = useFeatureFlagContext()

  useEffect(() => {
    if (typeof proposals?.total === 'number') {
      const maxPage = Math.ceil(proposals.total / ITEMS_PER_PAGE)
      if (page > maxPage) {
        handlePageFilter(maxPage)
      }
    }
  }, [ page, proposals ])

  // const [ showOnboarding, setShowOnboarding ] = useState(Onboarding.Loading)

  // Onboarding
  // useEffect(() => {
  //   const welcomeVersion = localStorage.getItem(WELCOME_STORE_KEY)
  //   setShowOnboarding(welcomeVersion !== WELCOME_STORE_VERSION ? Onboarding.Yes : Onboarding.No)
  // }, [])
  //
  // function handleCloseOnboarding() {
  //   localStorage.setItem(WELCOME_STORE_KEY, WELCOME_STORE_VERSION)
  //   setShowOnboarding(Onboarding.No)
  //   if (view === ProposalListView.Onboarding) {
  //     const newParams = new URLSearchParams(params)
  //     newParams.delete('view')
  //     navigate(locations.proposals(newParams))
  //   }
  // }

  function handlePageFilter(page: number) {
    const newParams = new URLSearchParams(params)
    page !== 1 ? newParams.set('page', String(page)) : newParams.delete('page')
    return navigate(locations.proposals(newParams))
  }

  function handleStatusFilter(status: ProposalStatus | null) {
    const newParams = new URLSearchParams(params)
    status ? newParams.set('status', status) : newParams.delete('status')
    newParams.delete('page')
    return navigate(locations.proposals(newParams))
  }

  // if (showOnboarding === Onboarding.Loading) {
  //   return <Container className="WelcomePage">
  //     <div>
  //       <Loader size="huge" active/>
  //     </div>
  //   </Container>
  // }

  // if (showOnboarding === Onboarding.Yes || view === ProposalListView.Onboarding) {
  //   return <Container className="WelcomePage">
  //     <div>
  //       <Carousel progress>
  //         <WelcomeItem onClose={handleCloseOnboarding}>
  //           <Header>{l('page.welcome.1_panel_title')}</Header>
  //           <Markdown source={l('page.welcome.1_panel_description')!}/>
  //         </WelcomeItem>
  //         <WelcomeItem onClose={handleCloseOnboarding}>
  //           <Header>{l('page.welcome.2_panel_title')}</Header>
  //           <Markdown source={l('page.welcome.2_panel_description')!}/>
  //         </WelcomeItem>
  //         <WelcomeItem onClose={handleCloseOnboarding}>
  //           <Header>{l('page.welcome.3_panel_title')}</Header>
  //           <Markdown source={l('page.welcome.3_panel_description')!}/>
  //         </WelcomeItem>
  //         <WelcomeItem onClose={handleCloseOnboarding}>
  //           <Header>{l('page.welcome.4_panel_title')}</Header>
  //           <Markdown source={l('page.welcome.4_panel_description')!}/>
  //         </WelcomeItem>
  //       </Carousel>
  //     </div>
  //   </Container>
  // }

  if (isUnderMaintenance()) {
    return <>
    <Head
      title={
        (view === ProposalListView.Onboarding && l('page.welcome.title')) ||
        (view === ProposalListView.Enacted && l('page.proposal_enacted_list.title')) ||
        (type === ProposalType.Catalyst && l('page.proposal_catalyst_list.title')) ||
        (type === ProposalType.POI && l('page.proposal_poi_list.title')) ||
        (type === ProposalType.BanName && l('page.proposal_ban_name_list.title')) ||
        (type === ProposalType.Poll && l('page.proposal_poll_list.title')) ||
        l('page.proposal_list.title') || ''
      }
      description={
        (view === ProposalListView.Onboarding && l('page.welcome.description')) ||
        (view === ProposalListView.Enacted && l('page.proposal_enacted_list.description')) ||
        (type === ProposalType.Catalyst && l('page.proposal_catalyst_list.description')) ||
        (type === ProposalType.POI && l('page.proposal_poi_list.description')) ||
        (type === ProposalType.BanName && l('page.proposal_ban_name_list.description')) ||
        (type === ProposalType.Poll && l('page.proposal_poll_list.description')) ||
        l('page.proposal_list.description') || ''
      }
      image="https://decentraland.org/images/decentraland.png"
    />
      <Navigation activeTab={view !== ProposalListView.Enacted ? NavigationTab.Proposals : NavigationTab.Enacted} />
      <MaintenancePage />
    </>
  }

  return <>
    <div className="OnlyMobile Animated"
        style={(isMobile && burgerMenu?.status && {transform: 'translateX(-200%)', height: 0}) || {}}
    > 
      <SubscriptionBanner active={!type} />
    </div>
    <Head
      title={
        (view === ProposalListView.Onboarding && l('page.welcome.title')) ||
        (view === ProposalListView.Enacted && l('page.proposal_enacted_list.title')) ||
        (type === ProposalType.Catalyst && l('page.proposal_catalyst_list.title')) ||
        (type === ProposalType.POI && l('page.proposal_poi_list.title')) ||
        (type === ProposalType.BanName && l('page.proposal_ban_name_list.title')) ||
        (type === ProposalType.Poll && l('page.proposal_poll_list.title')) ||
        l('page.proposal_list.title') || ''
      }
      description={
        (view === ProposalListView.Onboarding && l('page.welcome.description')) ||
        (view === ProposalListView.Enacted && l('page.proposal_enacted_list.description')) ||
        (type === ProposalType.Catalyst && l('page.proposal_catalyst_list.description')) ||
        (type === ProposalType.POI && l('page.proposal_poi_list.description')) ||
        (type === ProposalType.BanName && l('page.proposal_ban_name_list.description')) ||
        (type === ProposalType.Poll && l('page.proposal_poll_list.description')) ||
        l('page.proposal_list.description') || ''
      }
      image="https://decentraland.org/images/decentraland.png"
    />
    <Navigation activeTab={view !== ProposalListView.Enacted ? NavigationTab.Proposals : NavigationTab.Enacted} />
    <Container>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column tablet="4">
            {
              isMobile ? 
              <BurgerMenuContent footerTranslate={translate}>
                <MobileNavigation />
                <CategoryList />
              </BurgerMenuContent> : <CategoryList />
            }
          </Grid.Column>
          <Grid.Column tablet="12"
            className="Animated"
            style={(isMobile && burgerMenu?.status && {transform: `translateY(${translate})`}) || {}}
          >
            <ActionableLayout
              leftAction={<Header sub>
                {!proposals && ''}
                {proposals && l(`general.count_proposals`, { count: proposals.total || 0 })}
              </Header>}
              rightAction={view !== ProposalListView.Enacted && <>
                <StatusMenu style={{ marginRight: '1rem' }} value={status} onChange={(_, { value }) => handleStatusFilter(value)} />
                <Button primary size="small" className="SubmitButton" as={Link} href={locations.submit()} onClick={prevent(() => navigate(locations.submit()))}>
                  {l(`page.proposal_list.new_proposal`)}
                </Button>
              </>}
            >
              <Loader active={!proposals || proposalsState.loading} />
              <div className="OnlyDesktop">
                <SubscriptionBanner active={!type} />
              </div>
              {type && <CategoryBanner type={type} active />}
              {proposals && proposals.data.length === 0 && <Empty description={l(`page.proposal_list.no_proposals_yet`)} />}
              {proposals && proposals.data.map(proposal => {
                return <ProposalItem
                  key={proposal.id}
                  proposal={proposal}
                  votes={votes ? votes[proposal.id] : undefined}
                  subscribing={subscriptionsState.subscribing.includes(proposal.id)}
                  subscribed={!!subscriptions.find(subscription => subscription.proposal_id === proposal.id)}
                  onSubscribe={(_, proposal) => subscriptionsState.subscribe(proposal.id)}
                />
              })}
              {proposals && proposals.total > ITEMS_PER_PAGE && <Pagination
                onPageChange={(e, { activePage }) => handlePageFilter(activePage as number)}
                totalPages={Math.ceil(proposals.total / ITEMS_PER_PAGE)}
                activePage={page}
                firstItem={null}
                lastItem={null}
              />}
            </ActionableLayout>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  </>
}
