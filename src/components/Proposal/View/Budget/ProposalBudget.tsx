import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import snakeCase from 'lodash/snakeCase'

import { ExpectedBudget } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { getFormattedPercentage } from '../../../../helpers'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'
import Helper from '../../../Helper/Helper'
import { ContentSection } from '../../../Layout/ContentLayout'

import './ProposalBudget.css'
import RequestedBudgetCard from './RequestedBudgetCard'

interface Props {
  proposal: ProposalAttributes
  expectedBudget: ExpectedBudget
}

export default function ProposalBudget({ proposal, expectedBudget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const allocatedCategoryBudget = expectedBudget.categories[snakeCase(grantCategory)].allocated
  const totalCategoryBudget = expectedBudget.categories[snakeCase(grantCategory)].total
  const remainingCategoryBudget = totalCategoryBudget - allocatedCategoryBudget

  return (
    <ContentSection className="ProposalBudget__Content">
      <div className="ProposalBudget__Row">
        <RequestedBudgetCard proposal={proposal} expectedBudget={expectedBudget} />
        <GrantRequestSectionCard
          title={t('page.submit_grant.funding_section.category_budget_title')}
          helper={
            <Helper
              text={t('page.submit_grant.funding_section.category_budget_info')}
              size="16"
              position="right center"
            />
          }
          content={`$${t('general.number', {
            value: remainingCategoryBudget,
          })}`}
          titleExtra={`(${getFormattedPercentage(remainingCategoryBudget, totalCategoryBudget, 0)})`}
          subtitle={t('page.submit_grant.funding_section.category_budget_total', {
            value: totalCategoryBudget,
          })}
          subtitleVariant="uppercase"
        />
      </div>
    </ContentSection>
  )
}
