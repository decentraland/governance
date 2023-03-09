import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { NewGrantCategory } from '../../../../entities/Grant/types'
import { GrantProposalConfiguration } from '../../../../entities/Proposal/types'
import BudgetBreakdownView from '../../../GrantRequest/BudgetBreakdownView'
import PersonnelView from '../../../GrantRequest/PersonnelView'
import CategoryAssessment from '../../CategoryAssessment'
import ProposalDescriptionItem from '../ProposalDescriptionItem'

interface Props {
  config: GrantProposalConfiguration
}

const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

function GrantProposalView({ config }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const {
    category,
    size,
    projectDuration,
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
  } = config

  const isBudgetBreakdown = budgetBreakdown && budgetBreakdown.length > 0
  const isMembers = members && members.length > 0

  return (
    <div>
      <Paragraph>
        {t('page.proposal_view.grant.header', {
          value: intl.formatNumber(size, CURRENCY_FORMAT_OPTIONS as any),
          category,
        })}
      </Paragraph>
      <ProposalDescriptionItem title={t('page.proposal_view.grant.abstract_title')} body={abstract} />
      <ProposalDescriptionItem
        title={t('page.proposal_view.grant.size_title')}
        body={`${intl.formatNumber(size)} USD`}
      />
      {projectDuration && (
        <ProposalDescriptionItem
          title={t('page.proposal_view.grant.duration_title')}
          body={t('page.proposal_view.grant.breakdown_subtitle', { duration: projectDuration })}
        />
      )}
      <ProposalDescriptionItem title={t('page.proposal_view.grant.beneficiary_title')} body={beneficiary} />
      <ProposalDescriptionItem title={t('page.proposal_view.grant.email_title')} body={email} />
      <ProposalDescriptionItem title={t('page.proposal_view.grant.description_title')} body={description} />
      {isBudgetBreakdown && <BudgetBreakdownView breakdown={budgetBreakdown} />}
      {!isBudgetBreakdown && specification && (
        <ProposalDescriptionItem title={t('page.proposal_view.grant.specification_title')} body={specification} />
      )}
      {isMembers && <PersonnelView members={members} />}
      {!isMembers && personnel && (
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
