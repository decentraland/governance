import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import Time, { formatDate } from '../../utils/date/Time'
import DateTooltip from '../Common/DateTooltip'
import Divider from '../Common/Divider'
import { ContentSection } from '../Layout/ContentLayout'
import ArticleSectionHeading from '../Common/ArticleSectionHeading'
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
      <ArticleSectionHeading>{t('page.update_detail.introduction')}</ArticleSectionHeading>
      <Markdown>{update?.introduction || ''}</Markdown>
      <ArticleSectionHeading>{t('page.update_detail.highlights')}</ArticleSectionHeading>
      <Markdown>{update?.highlights || ''}</Markdown>
      <ArticleSectionHeading>{t('page.update_detail.blockers')}</ArticleSectionHeading>
      <Markdown>{update?.blockers || ''}</Markdown>
      <ArticleSectionHeading>{t('page.update_detail.next_steps')}</ArticleSectionHeading>
      <Markdown>{update?.next_steps || ''}</Markdown>
      {update?.additional_notes && (
        <>
          <ArticleSectionHeading>{t('page.update_detail.additional_notes')}</ArticleSectionHeading>
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
