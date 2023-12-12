import { useIntl } from 'react-intl'

import sum from 'lodash/sum'

import { UpdateFinancialRecord } from '../../entities/Updates/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import BreakdownAccordion, { BreakdownItem } from '../GrantRequest/BreakdownAccordion'

import SummaryContent, { SummaryContentProps } from './SummaryContent'

interface Props {
  records: UpdateFinancialRecord[]
}

function SummaryItems({ records }: Props) {
  const t = useFormatMessage()
  const { formatNumber } = useIntl()
  const grouppedRecords = records.reduce((acc, record) => {
    const { concept, ...props } = record
    const group = acc.get(concept) || []
    group.push(props)
    acc.set(concept, group)
    return acc
  }, new Map<string, SummaryContentProps['group']>())
  const accordionItems = Array.from(grouppedRecords.entries()).map<BreakdownItem<SummaryContentProps>>(
    ([concept, group]) => ({
      title: concept,
      subtitle: t('page.proposal_update.summary_items', { count: group.length }),
      value: formatNumber(sum(group.map(({ amount }) => amount)), CURRENCY_FORMAT_OPTIONS),
      contentProps: { group },
      content: (props) => <SummaryContent {...props} />,
    })
  )
  return <BreakdownAccordion items={accordionItems} />
}

export default SummaryItems
