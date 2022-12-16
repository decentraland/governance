import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { UpdateStatus } from '../../entities/Updates/types'
import { UpdateAttributes } from '../../entities/Updates/types'
import { formatDate } from '../../modules/time'
import DateTooltip from '../Common/DateTooltip'
import Divider from '../Common/Divider'
import { ContentSection } from '../Layout/ContentLayout'
import Username from '../User/Username'

import ProjectHealthStatus from './ProjectHealthStatus'
import './UpdateMarkdownView.css'

interface Props {
  update: Omit<UpdateAttributes, 'id' | 'proposal_id'>
  author?: string
}

const UpdateMarkdownView = ({ update, author }: Props) => {
  const t = useFormatMessage()
  const formattedCompletionDate = update?.completion_date ? formatDate(update.completion_date) : ''
  const formattedEditDate = update?.updated_at ? formatDate(update.updated_at) : ''
  const formattedDueDate = Time.utc(update?.completion_date).from(Time.utc(update?.due_date), true)

  return (
    <ContentSection className="UpdateDetail__Content">
      {update?.health && <ProjectHealthStatus health={update.health} />}
      <Header as="h2">{t('page.update_detail.introduction')}</Header>
      <Markdown>{update?.introduction || ''}</Markdown>
      <Header as="h2">{t('page.update_detail.highlights')}</Header>
      <Markdown>{update?.highlights || ''}</Markdown>
      <Header as="h2">{t('page.update_detail.blockers')}</Header>
      <Markdown>{update?.blockers || ''}</Markdown>
      <Header as="h2">{t('page.update_detail.next_steps')}</Header>
      <Markdown>{update?.next_steps || ''}</Markdown>
      {update?.additional_notes && (
        <>
          <Header as="h2">{t('page.update_detail.additional_notes')}</Header>
          <Markdown>{update?.additional_notes}</Markdown>
        </>
      )}
      {author && update.completion_date && (
        <>
          <Divider size="small" />
          <div className="UpdateDetail__Date">
            <div className="UpdateDetail__CompletionDate">
              <Paragraph>
                <DateTooltip date={update.completion_date}>
                  {t('page.update_detail.completion_date', { date: formattedCompletionDate })}
                </DateTooltip>
              </Paragraph>
              {author && <Username address={author} linked />}
            </div>
            {update.updated_at !== update.created_at && (
              <div className="UpdateDetail__LastEdit">
                <Paragraph>
                  <DateTooltip date={update.updated_at}>
                    <Markdown>{t('page.update_detail.edit_date', { date: formattedEditDate })}</Markdown>
                  </DateTooltip>
                </Paragraph>
              </div>
            )}
            {update?.status === UpdateStatus.Late && (
              <Markdown>{t('page.update_detail.due_date', { date: formattedDueDate }) || ''}</Markdown>
            )}
          </div>
        </>
      )}
    </ContentSection>
  )
}

export default UpdateMarkdownView
