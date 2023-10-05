import React from 'react'
import { useIntl } from 'react-intl'

import { NewGrantCategory } from '../../../../entities/Grant/types'
import { GrantProposalConfiguration } from '../../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../../helpers'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import BudgetBreakdownView from '../../../GrantRequest/BudgetBreakdownView'
import PersonnelView from '../../../GrantRequest/PersonnelView'
import CategoryAssessment from '../../CategoryAssessment'
import ProposalDescriptionItem from '../ProposalDescriptionItem'

interface Props {
  config: GrantProposalConfiguration
}

function GrantProposalView({ config }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const {
    category,
    size,
    projectDuration,
    vestingStartDate,
    abstract,
    beneficiary,
    email,
    description,
    budgetBreakdown,
    specification,
    members,
    personnel,
    roadmap,
    categoryAssessment,
    paymentToken,
  } = config

  const hasBudgetBreakdown = budgetBreakdown && budgetBreakdown.length > 0
  const hasMembers = members && members.length > 0

  const amount = intl.formatNumber(size, CURRENCY_FORMAT_OPTIONS)

  return (
    <div>
      <ProposalDescriptionItem title={t('page.proposal_view.grant.abstract_title')} body={abstract} />
      <ProposalDescriptionItem
        title={t('page.proposal_view.grant.size_title')}
        body={
          paymentToken
            ? t('page.proposal_view.grant.size_body', {
                amount,
                token: paymentToken,
              })
            : `${amount} USD`
        }
      />
      {projectDuration && (
        <ProposalDescriptionItem
          title={t('page.proposal_view.grant.duration_title')}
          body={t('page.proposal_view.grant.breakdown_subtitle', { duration: projectDuration })}
        />
      )}
      {vestingStartDate && (
        <ProposalDescriptionItem
          title={t('page.proposal_view.grant.payout_strategy_title')}
          body={t('page.proposal_view.grant.payout_strategy_body', { startDate: vestingStartDate })}
        />
      )}
      <ProposalDescriptionItem
        title={t('page.proposal_view.grant.beneficiary_title')}
        body={beneficiary}
        className="ProposalMarkdown__BreakAnywhere"
      />
      <ProposalDescriptionItem title={t('page.proposal_view.grant.email_title')} body={email} />
      <ProposalDescriptionItem title={t('page.proposal_view.grant.description_title')} body={description} />
      {hasBudgetBreakdown && <BudgetBreakdownView breakdown={budgetBreakdown} />}
      {!hasBudgetBreakdown && specification && (
        <ProposalDescriptionItem title={t('page.proposal_view.grant.specification_title')} body={specification} />
      )}
      {hasMembers && <PersonnelView members={members} />}
      {!hasMembers && personnel && (
        <ProposalDescriptionItem title={t('page.proposal_view.grant.personnel_title')} body={personnel} />
      )}
      <ProposalDescriptionItem title={t('page.proposal_view.grant.roadmap_title')} body={roadmap} />
      {categoryAssessment && (
        <CategoryAssessment
          category={category as NewGrantCategory}
          data={categoryAssessment as Record<string, string>}
        />
      )}
    </div>
  )
}

export default GrantProposalView
