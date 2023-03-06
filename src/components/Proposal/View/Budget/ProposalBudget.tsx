import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import snakeCase from 'lodash/snakeCase'

import { ExpectedBudget } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { getFormattedPercentage } from '../../../../helpers'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'
import Helper from '../../../Helper/Helper'
import { ContentSection } from '../../../Layout/ContentLayout'

import DistributionBar, { DistributionItemProps } from './DistributionBar'
import './ProposalBudget.css'

interface Props {
  proposal: ProposalAttributes
  expectedBudget: ExpectedBudget
}

export default function ProposalBudget({ proposal, expectedBudget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const allocatedCategoryBudget = expectedBudget.categories[snakeCase(proposal.configuration.category)].allocated
  const totalCategoryBudget = expectedBudget.categories[snakeCase(proposal.configuration.category)].total
  const requestedBudget = proposal.configuration.size
  const remainingUncontestedBudget = totalCategoryBudget - requestedBudget - allocatedCategoryBudget
  const remainingBudgetDisplayed = remainingUncontestedBudget > 0 ? remainingUncontestedBudget : 0

  const items: DistributionItemProps[] = [
    { label: 'Allocated Budget', value: allocatedCategoryBudget, style: 'ProposalBudget__AllocatedBar' },
    { label: 'Requested Budget', value: requestedBudget, style: 'ProposalBudget__RequestedBar', selected: true },
    { label: 'Remaining Budget', value: remainingBudgetDisplayed, style: 'ProposalBudget__TotalBar' },
  ]

  return (
    <ContentSection className="ProposalBudget__Content">
      <div className="ProposalBudget__Row">
        {grantCategory && (
          <GrantRequestSectionCard
            title={'Requesting'}
            content={
              <div className="ProposalBudget__ContestedPercentage">
                <>${t('general.number', { value: proposal.configuration.size })}</>
                <DistributionBar items={items} total={totalCategoryBudget} />
              </div>
            }
            subtitle={`${getFormattedPercentage(requestedBudget, totalCategoryBudget, 0)} of quarterly category budget`}
          />
        )}
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
            value: allocatedCategoryBudget,
          })}`}
          titleExtra={`(${getFormattedPercentage(allocatedCategoryBudget, totalCategoryBudget, 0)})`}
          subtitle={t('page.submit_grant.funding_section.category_budget_total', {
            value: totalCategoryBudget,
          })}
          subtitleVariant="uppercase"
        />
      </div>
    </ContentSection>
  )
}
