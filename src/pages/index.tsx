
import React, { useMemo } from "react"
import { useLocation } from '@reach/router'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { navigate } from "gatsby-plugin-intl"
import Navigation, { NavigationTab } from "../components/Layout/Navigation"

import locations, { ProposalListView, toProposalListView, WELCOME_STORE_KEY, WELCOME_STORE_VERSION } from "../modules/locations"
import ActionableLayout from "../components/Layout/ActionableLayout"
import CategoryOption from "../components/Category/CategoryOption"
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
import './index.css'
import useProposals from "../hooks/useProposals"

enum Onboarding {
  Loading,
  Yes,
  No
}

export default function IndexPage() {
  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const type = toProposalType(params.get('type'))
  const status = toProposalStatus(params.get('status'))
  const view = toProposalListView(params.get('view'))
  const [ proposals ] = useProposals()
  const [ subscriptions, subscriptionsState ] = useSubscriptions()
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

  const filteredProposals = useMemo(() => proposals && proposals.filter(proposal => {

    if (type && proposal.type !== type) {
      return false
    }

    if (view && (proposal.status as any) !== ProposalListView.Enacted) {
      return false
    }

    if (!view && status && proposal.status !== status) {
      return false
    }

    return true
  }), [ proposals, type, status, view ])

  function handleTypeFilter(type: ProposalType | null) {
    const newParams = new URLSearchParams(params)
    type ? newParams.set('type', type) : newParams.delete('type')
    return locations.proposals(newParams)
  }

  function handleStatusFilter(status: ProposalStatus | null) {
    const newParams = new URLSearchParams(params)
    status ? newParams.set('status', status) : newParams.delete('status')
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
    <Container>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column tablet="4">
            <ActionableLayout
              leftAction={<Header sub>{l(`page.proposal_list.categories`)}</Header>}
            >
              <CategoryOption type={'all'} href={handleTypeFilter(null)} active={type === null} />
              <CategoryOption type={ProposalType.Catalyst} href={handleTypeFilter(ProposalType.Catalyst)} active={type === ProposalType.Catalyst} />
              <CategoryOption type={ProposalType.POI} href={handleTypeFilter(ProposalType.POI)} active={type === ProposalType.POI} />
              <CategoryOption type={ProposalType.BanName} href={handleTypeFilter(ProposalType.BanName)} active={type === ProposalType.BanName} />
              {/* <CategoryOption type={ProposalType.Grant} href={handleTypeFilter(ProposalType.Grant)} active={type === ProposalType.Grant} /> */}
              <CategoryOption type={ProposalType.Poll} href={handleTypeFilter(ProposalType.Poll)} active={type === ProposalType.Poll} />
            </ActionableLayout>
          </Grid.Column>
          <Grid.Column tablet="12">
            <ActionableLayout
              leftAction={<Header sub>{proposals ? l(`page.proposal_list.count_proposals`, { count: filteredProposals?.length || 0 }) : ''}</Header>}
              rightAction={view !== ProposalListView.Enacted && <>
                <StatusMenu style={{ marginRight: '1rem' }} value={status} onChange={(_, { value }) => handleStatusFilter(value)} />
                <Button primary size="small" as={Link} href={locations.submit()} onClick={prevent(() => navigate(locations.submit()))}>
                  {l(`page.proposal_list.new_proposal`)}
                </Button>
              </>}
            >
              {!proposals && <Loader active />}
              {type && <CategoryBanner type={type} active />}
              {filteredProposals && filteredProposals.length === 0 && <Empty description={l(`page.proposal_list.no_proposals_yet`)} />}
              {filteredProposals && filteredProposals.map(proposal => {
                return <ProposalItem
                  key={proposal.id}
                  proposal={proposal}
                  subscribing={subscriptionsState.subscribing.includes(proposal.id)}
                  subscribed={!!subscriptions.find(subscription => subscription.proposal_id === proposal.id)}
                  onSubscribe={(_, proposal) => subscriptionsState.subscribe(proposal.id)}
                />
              })}
            </ActionableLayout>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  </>
}
