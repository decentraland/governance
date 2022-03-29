import React, { useMemo } from 'react'
import { useLocation } from '@reach/router'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Divider from '../components/Section/Divider'
import { UpdateStatus } from '../entities/Updates/types'
import Username from '../components/User/Username'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import useProposalUpdate from '../hooks/useProposalUpdate'
import useProposal from '../hooks/useProposal'
import './update.css'

export default function UpdateDetail() {
  const l = useFormatMessage()
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

  const date = !!update?.due_date ? Time(update.due_date).format('MMMM') : Time(update?.completion_date).format('MMMM')
  const formattedCompletionDate = Time(update?.completion_date).fromNow()
  const formattedDueDate = Time(update?.completion_date).from(Time(update?.due_date), true)

  if (updateState.loading || profileState.loading) {
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

  return (
    <ContentLayout small>
      <ContentSection className="UpdateDetail__Header">
        <span className="UpdateDetail__ProjectTitle">
          {l('page.update_detail.project_title', { title: proposal?.title })}
        </span>
        <Header size="huge">{l('page.update_detail.title', { date })}</Header>
      </ContentSection>
      <ContentSection className="UpdateDetail__Content">
        <Header as="h2">{l('page.update_detail.introduction')}</Header>
        <Markdown source={update?.introduction} />
        <Header as="h2">{l('page.update_detail.highlights')}</Header>
        <Markdown source={update?.highlights} />
        <Header as="h2">{l('page.update_detail.blockers')}</Header>
        <Markdown source={update?.blockers} />
        <Header as="h2">{l('page.update_detail.next_steps')}</Header>
        <Markdown source={update?.next_steps} />
        {update?.additional_notes && (
          <>
            <Header as="h2">{l('page.update_detail.additional_notes')}</Header>
            <Markdown source={update?.additional_notes} />
          </>
        )}
        <Divider size="small" />
        <div className="UpdateDetail__Date">
          <div className="UpdateDetail__CompletionDate">
            <Paragraph>{l('page.update_detail.completion_date', { date: formattedCompletionDate })}</Paragraph>
            <Username profile={profile} proposalUser={proposal?.user} />
          </div>
          {update?.status === UpdateStatus.Late && (
            <Markdown source={l('page.update_detail.due_date', { date: formattedDueDate }) || ''} />
          )}
        </div>
      </ContentSection>
    </ContentLayout>
  )
}
