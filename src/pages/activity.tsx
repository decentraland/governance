
import React, { useMemo, useEffect } from "react"
import { useLocation } from '@reach/router'
import { Card } from "decentraland-ui/dist/components/Card/Card"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Pagination } from "decentraland-ui/dist/components/Pagination/Pagination"

import { navigate } from "gatsby-plugin-intl"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import MaintenancePage from "decentraland-gatsby/dist/components/Layout/MaintenancePage"
import locations, { ProposalActivityList, toProposalActivityList, toProposalListPage } from "../modules/locations"
import Navigation, { NavigationTab } from "../components/Layout/Navigation"
import ActionableLayout from "../components/Layout/ActionableLayout"
import StatusMenu from "../components/Status/StatusMenu"
import { ProposalStatus, toProposalStatus } from "../entities/Proposal/types"
import Filter from "../components/Filter/Filter"
import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { Governance } from "../api/Governance"
import useAuthContext from "decentraland-gatsby/dist/context/Auth/useAuthContext"
import ProposalCard from "../components/Proposal/ProposalCard"
import useSubscriptions from "../hooks/useSubscriptions"
import Empty from "../components/Proposal/Empty"
import Head from "decentraland-gatsby/dist/components/Head/Head"
import Paragraph from "decentraland-gatsby/dist/components/Text/Paragraph"
import Link from "decentraland-gatsby/dist/components/Text/Link"
import prevent from "decentraland-gatsby/dist/utils/react/prevent"
import useProposals from "../hooks/useProposals"
import './activity.css'
import { isUnderMaintenance } from "../modules/maintenance"
import LogIn from "../components/User/LogIn"

const ITEMS_PER_PAGE = 12

export default function WelcomePage() {
  const l = useFormatMessage()
  const [ account, accountState ] = useAuthContext()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const status = toProposalStatus(params.get('status')) ?? undefined
  const page = toProposalListPage(params.get('page')) ?? undefined
  const list = toProposalActivityList(params.get('list'))
  const load = !!account && !!list
  const filters = !account || !list ? {} :
    list === ProposalActivityList.MyProposals ? { user: account } :
    list === ProposalActivityList.Watchlist ? { subscribed: account } :
    {}
  const [ proposals, proposalsState ] = useProposals({ load, page, status, ...filters, itemsPerPage: ITEMS_PER_PAGE })
  const [ subscriptions, subscriptionsState ] = useSubscriptions()
  const [ results, subscriptionsResultsState ] = useAsyncMemo(() => Governance.get()
    .getVotes((proposals?.data || []).map(proposal => proposal.id)),
    [ account, proposals ],
    { callWithTruthyDeps: true }
  )

  useEffect(() => {
    if (typeof proposals?.total === 'number') {
      const maxPage = Math.ceil(proposals.total / ITEMS_PER_PAGE)
      if (page > maxPage) {
        handlePageFilter(maxPage)
      }
    }
  }, [ page, proposals ])

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

  function handlePageFilter(page: number) {
    const newParams = new URLSearchParams(params)
    page !== 1 ? newParams.set('page', String(page)) : newParams.delete('page')
    return navigate(locations.activity(newParams))
  }

  useEffect(() => {
    if (!list) {
      const newParams = new URLSearchParams(params)
      newParams.set('list', ProposalActivityList.MyProposals)
      navigate(locations.activity(newParams))
    }
  }, [ list ])

  if (isUnderMaintenance()) {
    return <>
      <Head
        title={l('page.proposal_activity.title') || ''}
        description={l('page.proposal_activity.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Activity} />
      <MaintenancePage />
    </>
  }

  if (!account) {  
    return <LogIn 
      title={l('page.proposal_activity.title') || ''}
      description={l('page.proposal_activity.description') || ''}
    />
  }

  return <>
    <Head
      title={l('page.proposal_activity.title') || ''}
      description={l('page.proposal_activity.description') || ''}
      image="https://decentraland.org/images/decentraland.png"
    />
    <Navigation activeTab={NavigationTab.Activity} />
    <Container className="ActivityPage">
      <ActionableLayout
        leftAction={
          <>
            <Filter active={list === ProposalActivityList.MyProposals} onClick={() => handleListFilter(ProposalActivityList.MyProposals)}>{l('page.proposal_activity.list_proposals')}</Filter>
            <Filter active={list === ProposalActivityList.Watchlist} onClick={() => handleListFilter(ProposalActivityList.Watchlist)}>{l('page.proposal_activity.list_watchlist')}</Filter>
          </>
        }
        rightAction={
          <StatusMenu style={{ marginRight: '1rem' }} value={status} onChange={(_, { value }) => handleStatusFilter(value)} />
        }
      >
        <div  style={{ marginTop: '16px', position: 'relative', minHeight: '200px' }}>
          <Loader active={proposalsState.loading} />
          {proposals && proposals.data.length === 0 && <Empty description={
              <Paragraph small secondary>
                {list === ProposalActivityList.Watchlist ? l(`page.proposal_activity.no_proposals_subscriptions`) :
                list === ProposalActivityList.MyProposals ? l(`page.proposal_activity.no_proposals_submitted`) :
                null}
                {' '}
                {list === ProposalActivityList.Watchlist ? <Link href={locations.proposals()} onClick={prevent(() => navigate(locations.proposals()))}>{l(`page.proposal_activity.no_proposals_subscriptions_action`)}</Link> :
                list === ProposalActivityList.MyProposals ? <Link href={locations.submit()} onClick={prevent(() => navigate(locations.submit()))}>{l(`page.proposal_activity.no_proposals_submitted_action`)}</Link> :
                null}
              </Paragraph>
          } />}
          {proposals && proposals.data.length > 0 && <Card.Group>
            {proposals.data.map(proposal => <ProposalCard
              key={proposal.id}
              proposal={proposal}
              subscribed={!!subscriptions.find(subscription => subscription.proposal_id === proposal.id)}
              subscribing={subscriptionsState.subscribing.includes(proposal.id)}
              onSubscribe={(_, proposal) => subscriptionsState.subscribe(proposal.id)}
              votes={results && results[proposal.id]}
            />)}
          </Card.Group>}
        </div>

        {proposals && proposals.total > ITEMS_PER_PAGE && <Pagination
            onPageChange={(e, { activePage }) => handlePageFilter(activePage as number)}
            totalPages={Math.ceil(proposals.total / ITEMS_PER_PAGE)}
            activePage={page}
            firstItem={null}
            lastItem={null}
          />}
      </ActionableLayout>
    </Container>
  </>
}
