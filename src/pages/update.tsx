import React, { useMemo } from 'react'
import { useLocation } from '@reach/router'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import useProposalUpdate from '../hooks/useProposalUpdate'
import useProposal from '../hooks/useProposal'
import useProposalUpdates from '../hooks/useProposalUpdates'
import UpdateMarkdownView from '../components/Updates/UpdateMarkdownView'
import './update.css'

export default function UpdateDetail() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id')
  const proposalId = params.get('proposalId')
  const [proposal] = useProposal(proposalId)
  const [profile, profileState] = useAsyncMemo(
    async () => (proposal?.user ? profiles.load(proposal.user) : null),
    [proposal?.user],
    {
      callWithTruthyDeps: true,
    }
  )
  const { update, state: updateState } = useProposalUpdate(updateId)
  const { publicUpdates, state: updatesState } = useProposalUpdates(proposalId)

  if (updateState.loading || profileState.loading || updatesState.loading) {
    return (
      <Container>
        <Loader size="huge" active />
      </Container>
    )
  }

  if (updateState.error) {
    return (
      <ContentLayout className="ProposalDetailPage">
        <NotFound />
      </ContentLayout>
    )
  }

  const index = publicUpdates && publicUpdates.length - Number(publicUpdates?.findIndex((item) => item.id === updateId))

  return (
    <ContentLayout small>
      <ContentSection className="UpdateDetail__Header">
        <span className="UpdateDetail__ProjectTitle">
          {t('page.update_detail.project_title', { title: proposal?.title })}
        </span>
        <Header size="huge">{t('page.update_detail.title', { index })}</Header>
      </ContentSection>
      {update && <UpdateMarkdownView update={update} profile={profile} proposalUser={proposal?.user} />}
    </ContentLayout>
  )
}
