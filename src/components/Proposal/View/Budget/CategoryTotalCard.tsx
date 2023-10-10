import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes, ProposalType } from '../../../../entities/Proposal/types'
import { CategoryIconVariant } from '../../../../helpers/styles'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import locations from '../../../../utils/locations'
import { getCategoryIcon } from '../../../Category/CategoryOption'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './CategoryTotalCard.css'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

export default function CategoryTotalCard({ proposal, budget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category

  return (
    <GrantRequestSectionCard
      title={
        <>
          {getCategoryIcon(snakeCase(grantCategory), CategoryIconVariant.Circled)}
          <span className="CategoryTotalCard__Title">
            {t('page.proposal_detail.grant.category_budget.title', { category: grantCategory })}
          </span>
        </>
      }
      content={
        <span className="CategoryTotalCard__Description">
          {t(`page.proposal_detail.grant.category_budget.description.${snakeCase(grantCategory)}`)}
        </span>
      }
      subtitle={
        <div className="CategoryTotalCard__Sub">
          {t('page.proposal_detail.grant.category_budget.total', {
            value: t('general.number', {
              value: budget.categories[snakeCase(grantCategory)].total,
            }),
          })}
        </div>
      }
      subtitleVariant="uppercase"
      href={locations.proposals({ type: ProposalType.Grant, subtype: grantCategory })}
    />
  )
}
