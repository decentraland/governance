import { useIntl } from 'react-intl'

import sum from 'lodash/sum'

import { FinancialRecord, FinancialRecordCateogry } from '../../entities/Updates/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import BreakdownAccordion, { BreakdownItem } from '../GrantRequest/BreakdownAccordion'

import SummaryContent, { SummaryContentProps } from './SummaryContent'

interface Props {
  financialRecords: FinancialRecord[]
}

function SummaryItems({ financialRecords }: Props) {
  const t = useFormatMessage()
  const { formatNumber } = useIntl()

  const groupedRecords = financialRecords.reduce((acc, record) => {
    const { category, ...props } = record
    const group = acc.get(category) || []
    group.push(props)
    acc.set(category, group)
    return acc
  }, new Map<FinancialRecordCateogry, SummaryContentProps['group']>())
  const accordionItems = Array.from(groupedRecords.entries()).map<BreakdownItem>(([category, group]) => ({
    title: category,
    subtitle: t('page.proposal_update.summary_items', { count: group.length }),
    value: formatNumber(sum(group.map(({ amount }) => amount)), CURRENCY_FORMAT_OPTIONS),
    content: <SummaryContent category={category} group={group} />,
  }))

  return <BreakdownAccordion items={accordionItems} />
}

export default SummaryItems
