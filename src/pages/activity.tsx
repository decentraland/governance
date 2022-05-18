import React, { useCallback, useEffect, useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Pagination } from 'decentraland-ui/dist/components/Pagination/Pagination'

import { Governance } from '../api/Governance'
import Empty from '../components/Common/Empty'
import Filter from '../components/Filter/Filter'
import ActionableLayout from '../components/Layout/ActionableLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import ProposalCard from '../components/Proposal/ProposalCard'
import StatusMenu from '../components/Status/StatusMenu'
import LogIn from '../components/User/LogIn'
import { ProposalStatus, toProposalStatus } from '../entities/Proposal/types'
import useProposals from '../hooks/useProposals'
import useSubscriptions from '../hooks/useSubscriptions'
import locations, { ProposalActivityList, toProposalActivityList, toProposalListPage } from '../modules/locations'
import { isUnderMaintenance } from '../modules/maintenance'

import './activity.css'

const ITEMS_PER_PAGE = 12

const getFilters = (account: string | null, list: ProposalActivityList | null) => {
  if (!!account && list === ProposalActivityList.MyProposals) {
    return { user: account }
  }

  if (!!account && list === ProposalActivityList.Watchlist) {
    return { subscribed: account }
  }

  return {}
}

export default function ActivityPage() {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const status = toProposalStatus(params.get('status')) ?? undefined
  const page = toProposalListPage(params.get('page')) ?? undefined
  const list = toProposalActivityList(params.get('list'))
  const load = !!account && !!list

  const filters = getFilters(account, list)
  const [proposals, proposalsState] = useProposals({ load, page, status, ...filters, itemsPerPage: ITEMS_PER_PAGE })
  const [subscriptions, subscriptionsState] = useSubscriptions()
  const [results] = useAsyncMemo(
    () => Governance.get().getVotes((proposals?.data || []).map((proposal) => proposal.id)),
    [account, proposals],
    { callWithTruthyDeps: true }
  )

  const handlePageFilter = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(params)
      page !== 1 ? newParams.set('page', String(page)) : newParams.delete('page')
      return navigate(locations.activity(newParams))
    },
    [params]
  )

  useEffect(() => {
    if (typeof proposals?.total === 'number') {
      const maxPage = Math.ceil(proposals.total / ITEMS_PER_PAGE)
      if (page > maxPage) {
        handlePageFilter(maxPage)
      }
    }
  }, [handlePageFilter, page, proposals])

  function handleStatusFilter(status: ProposalStatus | null) {
    const newParams = new URLSearchParams(params)
    status ? newParams.set('status', status) : newParams.delete('status')
    newParams.delete('page')
    return navigate(locations.activity(newParams))
  }

  function handleListFilter(list: ProposalActivityList) {
    const newParams = new URLSearchParams(params)
    newParams.set('list', list)
    newParams.delete('page')
    return navigate(locations.activity(newParams))
  }

  useEffect(() => {
    if (!list) {
      const newParams = new URLSearchParams(params)
      newParams.set('list', ProposalActivityList.MyProposals)
      navigate(locations.activity(newParams))
    }
  }, [list, params])

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.proposal_activity.title') || ''}
          description={t('page.proposal_activity.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Activity} />
        <MaintenancePage />
      </>
    )
  }

  if (!account) {
    return (
      <LogIn
        title={t('page.proposal_activity.title') || ''}
        description={t('page.proposal_activity.description') || ''}
      />
    )
  }

  return (
    <>
      <Head
        title={t('page.proposal_activity.title') || ''}
        description={t('page.proposal_activity.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Activity} />
      <Container className="ActivityPage">
        <ActionableLayout
          leftAction={
            <>
              <Filter
                active={list === ProposalActivityList.MyProposals}
                onClick={() => handleListFilter(ProposalActivityList.MyProposals)}
              >
                {t('page.proposal_activity.list_proposals')}
              </Filter>
              <Filter
                active={list === ProposalActivityList.Watchlist}
                onClick={() => handleListFilter(ProposalActivityList.Watchlist)}
              >
                {t('page.proposal_activity.list_watchlist')}
              </Filter>
            </>
          }
          rightAction={<StatusMenu value={status} onChange={(_, { value }) => handleStatusFilter(value)} />}
        >
          <div className="ActivityPage__ListContainer">
            <Loader active={proposalsState.loading} />
            {proposals && proposals.data.length === 0 && (
              <div className="ActivityPage__EmptyContainer">
                <Empty
                  description={
                    list === ProposalActivityList.Watchlist
                      ? t('page.proposal_activity.no_proposals_subscriptions')
                      : t('page.proposal_activity.no_proposals_submitted')
                  }
                  linkText={
                    list === ProposalActivityList.Watchlist
                      ? t('page.proposal_activity.no_proposals_subscriptions_action')
                      : t('page.proposal_activity.no_proposals_submitted_action')
                  }
                  onLinkClick={
                    list === ProposalActivityList.Watchlist
                      ? () => navigate(locations.proposals())
                      : () => navigate(locations.submit())
                  }
                />
              </div>
            )}
            {proposals && proposals.data.length > 0 && (
              <Card.Group>
                {proposals.data.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    subscribed={!!subscriptions.find((subscription) => subscription.proposal_id === proposal.id)}
                    subscribing={subscriptionsState.subscribing.includes(proposal.id)}
                    onSubscribe={(_, proposal) => subscriptionsState.subscribe(proposal.id)}
                    votes={results && results[proposal.id]}
                  />
                ))}
              </Card.Group>
            )}
          </div>

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
      </Container>
    </>
  )
}
