import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import toNumber from 'lodash/toNumber'

import { BudgetBreakdownConcept } from '../../entities/Grant/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import ProposalMarkdown from '../Proposal/View/ProposalMarkdown'

import BreakdownAccordion, { BreakdownItem } from './BreakdownAccordion'

interface Props {
  breakdown: BudgetBreakdownConcept[]
}

function BudgetBreakdownView({ breakdown }: Props) {
  const intl = useIntl()
  const t = useFormatMessage()
  const items = useMemo(
    () =>
      breakdown.map<BreakdownItem>(({ concept, duration, estimatedBudget, aboutThis, relevantLink }) => ({
        title: concept,
        subtitle: t('page.proposal_view.grant.breakdown_subtitle', { duration }),
        description: aboutThis,
        url: relevantLink,
        value: intl.formatNumber(toNumber(estimatedBudget), CURRENCY_FORMAT_OPTIONS),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [breakdown]
  )
  return (
    <>
      <ProposalMarkdown text={`## ${t('page.proposal_view.grant.breakdown_title')}`} />
      <BreakdownAccordion items={items} />
    </>
  )
}

export default BudgetBreakdownView
