
import React, { useMemo, useEffect } from "react"
import { useLocation } from '@reach/router'
import { Card } from "decentraland-ui/dist/components/Card/Card"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"

import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import locations, { ProposalList, toProposalList } from "../modules/locations"
import { navigate } from "gatsby-plugin-intl"
import Navigation, { NavigationTab } from "../components/Layout/Navigation"
import ActionableLayout from "../components/Layout/ActionableLayout"
import StatusMenu from "../components/Status/StatusMenu"
import { ProposalAttributes, ProposalStatus, toProposalStatus } from "../entities/Proposal/types"
import Filter from "../components/Filter/Filter"
import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { Governance } from "../api/Governance"
import useAuthContext from "decentraland-gatsby/dist/context/Auth/useAuthContext"
import ProposalCard from "../components/Proposal/ProposalCard"
import { cacheProposals } from "../modules/loader"
import useSubscriptions from "../hooks/useSubscriptions"
import './activity.css'
import Empty from "../components/Proposal/Empty"

export default function WelcomePage() {
  const l = useFormatMessage()
  const [ account, accountState ] = useAuthContext()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const status = toProposalStatus(params.get('status'))
  const list = toProposalList(params.get('list'))
  const [ proposals, proposalsState ] = useAsyncMemo(() => cacheProposals(Governance.get().getProposals({ user: account! })), [ account ], { callWithTruthyDeps: true })
  const [ subscriptions, subscriptionsState ] = useSubscriptions()
  const [ results, subscriptionsResultsState ] = useAsyncMemo(() => Governance.get()
    .getVotes([
      ...(subscriptions || []).map(subscription => subscription.proposal_id),
      ...(proposals || []).map(proposal => proposal.id)
    ]),
    [ account, proposals, subscriptions ],
    { callWithTruthyDeps: true }
  )

  const subscribedProposals = useMemo(() => {
    if (!account) {
      return []
    }

    if (!proposals || !subscriptions) {
      return []
    }

    switch (list) {
      case ProposalList.Enacted:
        return proposals.filter((proposal) => {
          if (!proposal) {
            return false
          }

          if (proposal.status !== ProposalStatus.Enacted) {
            return false
          }

          return true
        })

      case ProposalList.MyProposals:
        return proposals.filter((proposal) => {
          if (!proposal) {
            return false
          }

          if (proposal.user !== account) {
            return false
          }

          if (status && proposal.status !== status) {
            return false
          }

          return true
        })

      case ProposalList.Watchlist:
        const map = new Map<string, ProposalAttributes>(proposals.map(proposal => [ proposal.id, proposal ]))
        return subscriptions
          .map(subscription => map.get(subscription.proposal_id))
          .filter(proposal => {
            if (!proposal) {
              return false
            }

            if (status && proposal.status !== status) {
              return false
            }

            return true
          }) as ProposalAttributes[]

      default:
        return []
    }
  }, [ account, proposals, subscriptions, status, list ])

  function handleStatusFilter(status: ProposalStatus | null) {
    const newParams = new URLSearchParams(params)
    status ? newParams.set('status', status) : newParams.delete('status')
    return navigate(locations.activity(newParams))
  }

  function handleListFilter(list: ProposalList) {
    const newParams = new URLSearchParams(params)
    newParams.set('list', list)
    return navigate(locations.activity(newParams))
  }

  useEffect(() => {
    if (!list) {
      const newParams = new URLSearchParams(params)
      newParams.set('list', ProposalList.MyProposals)
      navigate(locations.activity(newParams))
    }
  }, [ list ])

  if (
    !account &&
    (
      list === ProposalList.MyProposals ||
      list === ProposalList.Watchlist
    )
  ) {
    return <>
    <Navigation activeTab={NavigationTab.Activity} />
    <Container className="ActivityPage">
      <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
    </Container>
    </>
  }

  return <>
    <Navigation activeTab={list === ProposalList.Enacted ? NavigationTab.Enacted : NavigationTab.Activity} />
    <Container className="ActivityPage">
      <ActionableLayout
        leftAction={
          list !== ProposalList.Enacted && <>
            <Filter active={list === ProposalList.MyProposals} onClick={() => handleListFilter(ProposalList.MyProposals)}>{l('page.proposal_activity.list_proposals')}</Filter>
            <Filter active={list === ProposalList.Watchlist} onClick={() => handleListFilter(ProposalList.Watchlist)}>{l('page.proposal_activity.list_watchlist')}</Filter>
          </>
        }
        rightAction={
          list !== ProposalList.Enacted &&
            <StatusMenu style={{ marginRight: '1rem' }} value={status} onChange={(_, { value }) => handleStatusFilter(value)} />
        }
      >
        <div  style={{ marginTop: '16px', position: 'relative', minHeight: '200px' }}>
          <Loader active={proposalsState.loading || subscriptionsState.loading} />
          {subscribedProposals.length === 0 && <Empty description={
              list === ProposalList.Enacted ? l(`page.proposal_activity.no_proposals_enacted`) :
              list === ProposalList.Watchlist ? l(`page.proposal_activity.no_proposals_subscriptions`) :
              list === ProposalList.MyProposals ? l(`page.proposal_activity.no_proposals_submitted`) :
              null
          } />}
          {subscribedProposals.length > 0 && <Card.Group>
            {subscribedProposals.map(proposal => <ProposalCard
              key={proposal.id}
              proposal={proposal}
              subscribed={!!subscriptions.find(subscription => subscription.proposal_id === proposal.id)}
              subscribing={subscriptionsState.subscribing.includes(proposal.id)}
              onSubscribe={(_, proposal) => subscriptionsState.subscribe(proposal.id)}
              votes={results && results[proposal.id]}
            />)}
          </Card.Group>}
        </div>
      </ActionableLayout>
    </Container>
  </>
}
