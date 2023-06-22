import React from 'react'

// import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import Time, { formatDate } from '../../utils/date/Time'
import ArticleSectionHeading from '../Common/ArticleSectionHeading'
import DateTooltip from '../Common/DateTooltip'
import Divider from '../Common/Divider'
import Markdown2 from '../Common/Markdown/Markdown'
import Text from '../Common/Text/Text'
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
      <ArticleSectionHeading>{t('page.update_detail.introduction')}</ArticleSectionHeading>
      {/*<Markdown>{update?.introduction || ''}</Markdown>*/}
      <Markdown2>{update?.introduction || ''}</Markdown2>
      <ArticleSectionHeading>{t('page.update_detail.highlights')}</ArticleSectionHeading>
      {/*<Markdown>{update?.highlights || ''}</Markdown>*/}
      <Markdown2>{update?.highlights || ''}</Markdown2>
      <ArticleSectionHeading>{t('page.update_detail.blockers')}</ArticleSectionHeading>
      {/*<Markdown>{update?.blockers || ''}</Markdown>*/}
      <Markdown2>{update?.blockers || ''}</Markdown2>
      <ArticleSectionHeading>{t('page.update_detail.next_steps')}</ArticleSectionHeading>
      {/*<Markdown>{update?.next_steps || ''}</Markdown>*/}
      <Markdown2>{update?.next_steps || ''}</Markdown2>
      {update?.additional_notes && (
        <>
          <ArticleSectionHeading>{t('page.update_detail.additional_notes')}</ArticleSectionHeading>
          {/*<Markdown>{update?.additional_notes}</Markdown>*/}
          <Markdown2>{update?.additional_notes}</Markdown2>
        </>
      )}
      {author && update.completion_date && (
        <>
          <Divider size="small" />
          <div className="UpdateDetail__Dates">
            <div className="UpdateDetail__CompletionDate">
              <Text className="UpdateDetail__CompletionDateText">
                <DateTooltip date={update.completion_date}>
                  {t('page.update_detail.completion_date', { date: formattedCompletionDate })}
                </DateTooltip>
              </Text>
              {author && <Username address={author} linked />}
            </div>
            {update.updated_at !== update.created_at && (
              <div className="UpdateDetail__LastEdit">
                <DateTooltip date={update.updated_at}>
                  {/*<Markdown>{t('page.update_detail.edit_date', { date: formattedEditDate })}</Markdown>*/}
                  <Markdown2>{t('page.update_detail.edit_date', { date: formattedEditDate })}</Markdown2>
                </DateTooltip>
              </div>
            )}
            {update?.status === UpdateStatus.Late && (
              <Markdown2>{t('page.update_detail.due_date', { date: formattedDueDate }) || ''}</Markdown2>
            )}
          </div>
        </>
      )}
    </ContentSection>
  )
}

export default UpdateMarkdownView
