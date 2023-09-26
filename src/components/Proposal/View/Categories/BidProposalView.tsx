import React from 'react'
import { useIntl } from 'react-intl'

import { BidRequest } from '../../../../entities/Bid/types'
import type { ProposalAttributes } from '../../../../entities/Proposal/types'
import { proposalUrl } from '../../../../entities/Proposal/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../../../helpers'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import useProposal from '../../../../hooks/useProposal'
import Time from '../../../../utils/date/Time'
import BudgetBreakdownView from '../../../GrantRequest/BudgetBreakdownView'
import PersonnelView from '../../../GrantRequest/PersonnelView'
import ProposalDescriptionItem from '../ProposalDescriptionItem'

interface Props {
  config: BidRequest
}

function getLinkedProposalLink(proposal: ProposalAttributes | null) {
  if (!proposal) {
    return ''
  }

  return `[${proposal.title}](${proposalUrl(proposal.id)})`
}

const formatDate = (date: Date | string) => Time.from(date).format('MMM DD, YYYY')

function BidProposalView({ config }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const {
    funding,
    projectDuration,
    deliveryDate,
    beneficiary,
    email,
    deliverables,
    roadmap,
    members,
    budgetBreakdown,
    linked_proposal_id,
  } = config

  const amount = intl.formatNumber(Number(funding), CURRENCY_FORMAT_OPTIONS)
  const { proposal: linkedProposal } = useProposal(linked_proposal_id)

  return (
    <div>
      <ProposalDescriptionItem body={t('page.proposal_view.bid.header')} />
      <ProposalDescriptionItem
        title={t('page.proposal_view.bid.linked_tender_title')}
        body={getLinkedProposalLink(linkedProposal)}
      />
      <ProposalDescriptionItem
        title={t('page.proposal_view.bid.budget_title')}
        body={t('page.proposal_view.bid.budget_body', { amount })}
      />
      <ProposalDescriptionItem
        title={t('page.proposal_view.bid.duration_title')}
        body={t('page.proposal_view.bid.duration_body', { duration: projectDuration })}
      />
      <ProposalDescriptionItem
        title={t('page.proposal_view.bid.delivery_date_title')}
        body={formatDate(deliveryDate)}
      />
      <ProposalDescriptionItem
        title={t('page.proposal_view.bid.beneficiary_title')}
        body={beneficiary}
        className="ProposalMarkdown__BreakAnywhere"
      />
      <ProposalDescriptionItem title={t('page.proposal_view.bid.email_title')} body={email} />
      <ProposalDescriptionItem title={t('page.proposal_view.bid.deliverables_title')} body={deliverables} />
      <ProposalDescriptionItem title={t('page.proposal_view.bid.roadmap_title')} body={roadmap} />
      <BudgetBreakdownView breakdown={budgetBreakdown} />
      <PersonnelView members={members} />
    </div>
  )
}

export default BidProposalView
