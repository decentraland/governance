import React, { useMemo } from 'react'

import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import toNumber from 'lodash/toNumber'

import { BudgetBreakdownConcept } from '../../entities/Grant/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import { PROPOSAL_DESCRIPTION_MARKDOWN_STYLES } from '../../pages/proposal'
import Markdown from '../Common/Markdown/Markdown'

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
        value: intl.formatNumber(toNumber(estimatedBudget), CURRENCY_FORMAT_OPTIONS as any),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [breakdown]
  )
  return (
    <>
      <Markdown componentsClassNames={PROPOSAL_DESCRIPTION_MARKDOWN_STYLES}>{`## ${t(
        'page.proposal_view.grant.breakdown_title'
      )}`}</Markdown>
      <BreakdownAccordion items={items} />
    </>
  )
}

export default BudgetBreakdownView
