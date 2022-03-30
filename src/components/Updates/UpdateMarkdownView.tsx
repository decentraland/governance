import React from 'react'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'
import Divider from '../Section/Divider'
import { UpdateStatus } from '../../entities/Updates/types'
import Username from '../User/Username'
import ProjectHealthStatus from './ProjectHealthStatus'
import { UpdateAttributes } from '../../entities/Updates/types'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  update: Omit<UpdateAttributes, 'id' | 'proposal_id' | 'created_at' | 'updated_at'>
  profile?: Profile
  proposalUser?: string
}

const UpdateMarkdownView = ({ update, profile, proposalUser }: Props) => {
  const l = useFormatMessage()
  const formattedCompletionDate = Time(update?.completion_date).fromNow()
  const formattedDueDate = Time(update?.completion_date).from(Time(update?.due_date), true)

  return (
    <ContentSection className="UpdateDetail__Content">
      {update?.health && <ProjectHealthStatus health={update.health} />}
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
      {(profile || proposalUser) && (
        <>
          <Divider size="small" />
          <div className="UpdateDetail__Date">
            <div className="UpdateDetail__CompletionDate">
              <Paragraph>{l('page.update_detail.completion_date', { date: formattedCompletionDate })}</Paragraph>
              <Username profile={profile} proposalUser={proposalUser} />
            </div>
            {update?.status === UpdateStatus.Late && (
              <Markdown source={l('page.update_detail.due_date', { date: formattedDueDate }) || ''} />
            )}
          </div>
        </>
      )}
    </ContentSection>
  )
}

export default UpdateMarkdownView
