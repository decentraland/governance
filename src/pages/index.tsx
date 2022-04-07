import React, { useEffect } from 'react'
import { useLocation } from '@gatsbyjs/reach-router'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Pagination } from 'decentraland-ui/dist/components/Pagination/Pagination'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import locations from '../modules/locations'
import ActionableLayout from '../components/Layout/ActionableLayout'
import { ProposalType } from '../entities/Proposal/types'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import CategoryBanner from '../components/Category/CategoryBanner'
import ProposalItem from '../components/Proposal/ProposalItem'
import useSubscriptions from '../hooks/useSubscriptions'
import Empty from '../components/Proposal/Empty'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import prevent from 'decentraland-gatsby/dist/utils/react/prevent'
import useProposals from '../hooks/useProposals'
import SubscriptionBanner from '../components/Subscription/SubscriptionBanner'
import { Governance } from '../api/Governance'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'
import BurgerMenuContent from '../components/Layout/BurgerMenuContent'
import { isUnderMaintenance } from '../modules/maintenance'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import CategoryFilter from '../components/Search/CategoryFilter'
import StatusFilter from '../components/Search/StatusFilter'
import TimeFrameFilter from '../components/Search/TimeFrameFilter'
import { SearchTitle } from '../components/Search/SearchTitle'
import SortingMenu from '../components/Search/SortingMenu'
import { useBurgerMenu } from '../hooks/useBurgerMenu'
import { useSearchParams } from '../hooks/useSearchParams'
import './index.css'

const ITEMS_PER_PAGE = 25

export default function IndexPage() {
  const t = useFormatMessage()
  const location = useLocation()
  const { type, status, search, searching, timeFrame, order, page } = useSearchParams()
  const [proposals, proposalsState] = useProposals({
    type,
    status,
    page,
    search,
    timeFrame,
    order,
    itemsPerPage: ITEMS_PER_PAGE,
  })
  const [votes] = useAsyncMemo(
    () => Governance.get().getVotes((proposals?.data || []).map((proposal) => proposal.id)),
    [proposals],
    { callWithTruthyDeps: true }
  )
  const [subscriptions, subscriptionsState] = useSubscriptions()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const { status: burgerStatus } = useBurgerMenu()
  const { open, translate } = burgerStatus

  useEffect(() => {
    if (typeof proposals?.total === 'number') {
      const maxPage = Math.ceil(proposals.total / ITEMS_PER_PAGE)
      if (page > maxPage) {
        handlePageFilter(maxPage)
      }
    }
  }, [page, proposals])

  function handlePageFilter(page: number) {
    const newParams = new URLSearchParams(location.search)
    page !== 1 ? newParams.set('page', String(page)) : newParams.delete('page')
    return navigate(locations.proposals(newParams))
  }

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={
            (type === ProposalType.Catalyst && t('page.proposal_catalyst_list.title')) ||
            (type === ProposalType.POI && t('page.proposal_poi_list.title')) ||
            (type === ProposalType.BanName && t('page.proposal_ban_name_list.title')) ||
            (type === ProposalType.Poll && t('page.proposal_poll_list.title')) ||
            t('page.proposal_list.title') ||
            ''
          }
          description={
            (type === ProposalType.Catalyst && t('page.proposal_catalyst_list.description')) ||
            (type === ProposalType.POI && t('page.proposal_poi_list.description')) ||
            (type === ProposalType.BanName && t('page.proposal_ban_name_list.description')) ||
            (type === ProposalType.Poll && t('page.proposal_poll_list.description')) ||
            t('page.proposal_list.description') ||
            ''
          }
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Proposals} />
        <MaintenancePage />
      </>
    )
  }

  return (
    <>
      <div
        className="OnlyMobile Animated"
        style={(isMobile && open && { transform: 'translateX(-200%)', height: 0 }) || {}}
      >
        <SubscriptionBanner active={!type} />
      </div>
      <Head
        title={
          (type === ProposalType.Catalyst && t('page.proposal_catalyst_list.title')) ||
          (type === ProposalType.POI && t('page.proposal_poi_list.title')) ||
          (type === ProposalType.BanName && t('page.proposal_ban_name_list.title')) ||
          (type === ProposalType.Poll && t('page.proposal_poll_list.title')) ||
          t('page.proposal_list.title') ||
          ''
        }
        description={
          (type === ProposalType.Catalyst && t('page.proposal_catalyst_list.description')) ||
          (type === ProposalType.POI && t('page.proposal_poi_list.description')) ||
          (type === ProposalType.BanName && t('page.proposal_ban_name_list.description')) ||
          (type === ProposalType.Poll && t('page.proposal_poll_list.description')) ||
          t('page.proposal_list.description') ||
          ''
        }
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Proposals} />
      <Container>
        {!isMobile && search && proposals && <SearchTitle />}
        <Grid stackable>
          <Grid.Row>
            <Grid.Column tablet="4">
              {isMobile ? (
                <BurgerMenuContent />
              ) : (
                <div>
                  <CategoryFilter />
                  <StatusFilter />
                  <TimeFrameFilter />
                </div>
              )}
            </Grid.Column>
            <Grid.Column
              tablet="12"
              className="Animated ProposalsTable"
              style={isMobile ? (!!translate ? { transform: `translateY(${translate})` } : {}) : {}}
            >
              {isMobile && proposals && <SearchTitle />}
              <ActionableLayout
                leftAction={
                  <Header sub>
                    {!proposals && ''}
                    {proposals && t(`general.count_proposals`, { count: proposals.total || 0 })}
                  </Header>
                }
                rightAction={
                  !searching && (
                    <>
                      {proposals && <SortingMenu />}
                      <Button
                        primary
                        size="small"
                        className="SubmitButton"
                        as={Link}
                        href={locations.submit()}
                        onClick={prevent(() => navigate(locations.submit()))}
                      >
                        {t(`page.proposal_list.new_proposal`)}
                      </Button>
                    </>
                  )
                }
              >
                <Loader active={!proposals || proposalsState.loading} />
                <div className="OnlyDesktop">{!searching && <SubscriptionBanner active={!type} />}</div>
                {type && !searching && <CategoryBanner type={type} active />}
                {proposals && proposals.data.length === 0 && (
                  <Empty
                    description={
                      searching || status || timeFrame?.length > 0
                        ? t(`navigation.search.no_matches`)
                        : t(`page.proposal_list.no_proposals_yet`)
                    }
                  />
                )}
                {proposals &&
                  proposals.data.map((proposal) => {
                    return (
                      <ProposalItem
                        key={proposal.id}
                        proposal={proposal}
                        votes={votes ? votes[proposal.id] : undefined}
                        subscribing={subscriptionsState.subscribing.includes(proposal.id)}
                        subscribed={!!subscriptions.find((subscription) => subscription.proposal_id === proposal.id)}
                        onSubscribe={(_, proposal) => subscriptionsState.subscribe(proposal.id)}
                      />
                    )
                  })}
                {proposals && proposals.total > ITEMS_PER_PAGE && (
                  <Pagination
                    onPageChange={(e, { activePage }) => handlePageFilter(activePage as number)}
                    totalPages={Math.ceil(proposals.total / ITEMS_PER_PAGE)}
                    activePage={page}
                    firstItem={null}
                    lastItem={null}
                  />
                )}
              </ActionableLayout>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </>
  )
}
