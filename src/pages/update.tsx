import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import LoadingView from '../components/Layout/LoadingView'
import UpdateMarkdownView from '../components/Updates/UpdateMarkdownView'
import useProposal from '../hooks/useProposal'
import useProposalUpdate from '../hooks/useProposalUpdate'
import useProposalUpdates from '../hooks/useProposalUpdates'
import locations from '../modules/locations'

import './update.css'

export default function UpdateDetail() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id')
  const { update, state: updateState } = useProposalUpdate(updateId)
  const [proposal, proposalState] = useProposal(update?.proposal_id)
  const { publicUpdates, state: updatesState } = useProposalUpdates(update?.proposal_id)

  if (updateState.error || proposalState.error || updatesState.error) {
    return (
      <ContentLayout>
        <NotFound />
      </ContentLayout>
    )
  }

  if (!update || updateState.loading || updatesState.loading || proposalState.loading) {
    return <LoadingView />
  }

  const index = publicUpdates && publicUpdates.length - Number(publicUpdates?.findIndex((item) => item.id === updateId))
  const proposalHref = locations.proposal(update.proposal_id)

  return (
    <ContentLayout navigateHref={proposalHref} small>
      <ContentSection className="UpdateDetail__Header">
        <span className="UpdateDetail__ProjectTitle">
          {t('page.update_detail.project_title', { title: <Link href={proposalHref}>{proposal?.title}</Link> })}
        </span>
        <Header size="huge">{t('page.update_detail.title', { index })}</Header>
      </ContentSection>
      {update && <UpdateMarkdownView update={update} proposalUser={proposal?.user} />}
    </ContentLayout>
  )
}
