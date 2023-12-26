import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time, { formatDate } from '../../utils/date/Time'
import ArticleSectionHeading from '../Common/ArticleSectionHeading'
import DateTooltip from '../Common/DateTooltip'
import Divider from '../Common/Divider'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'
import Username from '../Common/Username'
import { ContentSection } from '../Layout/ContentLayout'

import ProjectHealthStatus from './ProjectHealthStatus'
import SummaryItems from './SummaryItems'
import './UpdateMarkdownView.css'

interface Props {
  update: Omit<UpdateAttributes, 'id' | 'proposal_id'>
  author?: string
}

const UPDATE_DETAIL_MARKDOWN_STYLES = { p: 'UpdateDetail__ContentText', li: 'UpdateDetail__ListItem' }

const UpdateMarkdownView = ({ update, author }: Props) => {
  const t = useFormatMessage()
  const formattedCompletionDate = update?.completion_date ? formatDate(update.completion_date) : ''
  const formattedEditDate = update?.updated_at ? formatDate(update.updated_at) : ''
  const formattedDueDate = Time.utc(update?.completion_date).from(Time.utc(update?.due_date), true)

  return (
    <ContentSection className="UpdateDetail__Content">
      {update?.health && <ProjectHealthStatus health={update.health} />}
      <ArticleSectionHeading>{t('page.update_detail.introduction')}</ArticleSectionHeading>
      <Markdown componentsClassNames={UPDATE_DETAIL_MARKDOWN_STYLES}>{update?.introduction || ''}</Markdown>
      <ArticleSectionHeading>{t('page.update_detail.highlights')}</ArticleSectionHeading>
      <Markdown componentsClassNames={UPDATE_DETAIL_MARKDOWN_STYLES}>{update?.highlights || ''}</Markdown>
      <ArticleSectionHeading>{t('page.update_detail.blockers')}</ArticleSectionHeading>
      <Markdown componentsClassNames={UPDATE_DETAIL_MARKDOWN_STYLES}>{update?.blockers || ''}</Markdown>
      <ArticleSectionHeading>{t('page.update_detail.next_steps')}</ArticleSectionHeading>
      <Markdown componentsClassNames={UPDATE_DETAIL_MARKDOWN_STYLES}>{update?.next_steps || ''}</Markdown>
      {update?.additional_notes && (
        <>
          <ArticleSectionHeading>{t('page.update_detail.additional_notes')}</ArticleSectionHeading>
          <Markdown componentsClassNames={UPDATE_DETAIL_MARKDOWN_STYLES}>{update?.additional_notes}</Markdown>
        </>
      )}
      {update?.financial_records && update?.financial_records.length > 0 && (
        <>
          <ArticleSectionHeading>{t('page.update_detail.financial_details')}</ArticleSectionHeading>
          <SummaryItems financialRecords={update?.financial_records} />
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
              <div className="UpdateDetail__CompletionDate">
                <DateTooltip date={update.updated_at}>
                  <Markdown
                    componentsClassNames={{
                      p: 'UpdateDetail__CompletionDateText',
                      strong: 'UpdateDetail__CompletionDateText',
                    }}
                  >
                    {t('page.update_detail.edit_date', { date: formattedEditDate })}
                  </Markdown>
                </DateTooltip>
              </div>
            )}
            {update?.status === UpdateStatus.Late && (
              <Markdown
                componentsClassNames={{
                  p: 'UpdateDetail__CompletionDateText',
                  strong: 'UpdateDetail__CompletionDateText',
                }}
              >
                {t('page.update_detail.due_date', { date: formattedDueDate }) || ''}
              </Markdown>
            )}
          </div>
        </>
      )}
    </ContentSection>
  )
}

export default UpdateMarkdownView
