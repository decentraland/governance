import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import snakeCase from 'lodash/snakeCase'

import { ExpectedBudget } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { CategoryIconVariant } from '../../../../helpers/styles'
import { getCategoryIcon } from '../../../Category/CategoryOption'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './CategoryTotalCard.css'

interface Props {
  proposal: ProposalAttributes
  expectedBudget: ExpectedBudget
}

export default function CategoryTotalCard({ proposal, expectedBudget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const totalCategoryBudget = expectedBudget.categories[snakeCase(grantCategory)].total

  return (
    <GrantRequestSectionCard
      title={
        <>
          {getCategoryIcon(snakeCase(grantCategory), CategoryIconVariant.Circled)}
          <span className="CategoryTotalCard__Title">{grantCategory + ' INITIATIVE'}</span>
        </>
      }
      content={
        <span className="CategoryTotalCard__Description">
          {'Seeking funding for the development of experiences to improve user retention'}
        </span>
      }
      subtitle={t('page.submit_grant.funding_section.category_budget_total', {
        value: totalCategoryBudget,
      })}
      subtitleVariant="uppercase"
    />
  )
}
