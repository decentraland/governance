import React from 'react'
import { useIntl } from 'react-intl'

import { BidRequest } from '../../../../entities/Bid/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../../helpers'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import locations from '../../../../utils/locations'
import BudgetBreakdownView from '../../../GrantRequest/BudgetBreakdownView'
import PersonnelView from '../../../GrantRequest/PersonnelView'
import ProposalDescriptionItem from '../ProposalDescriptionItem'

interface Props {
  config: BidRequest
}

function BidProposalView({ config }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const {
    funding,
    projectDuration,
    startDate,
    beneficiary,
    email,
    deliverables,
    roadmap,
    members,
    budgetBreakdown,
    linked_proposal_id,
  } = config

  const amount = intl.formatNumber(funding, CURRENCY_FORMAT_OPTIONS as any)
  const linkedProposalUrl = locations.proposal(linked_proposal_id)

  return (
    <div>
      <ProposalDescriptionItem body={'Should bla bla bla...'} />
      <ProposalDescriptionItem title={'Linked Tender Proposal'} body={linkedProposalUrl} />
      <ProposalDescriptionItem title={'Budget'} body={amount} />
      <ProposalDescriptionItem
        title={'Project Duration'}
        body={t('page.proposal_view.grant.breakdown_subtitle', { duration: projectDuration })}
      />
      <ProposalDescriptionItem title={'Start Date'} body={startDate} />
      <ProposalDescriptionItem title={'Beneficiary Address'} body={beneficiary} />
      <ProposalDescriptionItem title={'Email Address'} body={email} />
      <ProposalDescriptionItem title={'Deliverables'} body={deliverables} />
      <ProposalDescriptionItem title={'Roadmap and milestones'} body={roadmap} />
      <BudgetBreakdownView breakdown={budgetBreakdown} />
      <PersonnelView members={members} />
    </div>
  )
}

export default BidProposalView
