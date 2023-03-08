import React from 'react'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { ContentSection } from '../../../Layout/ContentLayout'

import CategoryTotalCard from './CategoryTotalCard'
import './ProposalBudget.css'
import RequestedBudgetCard from './RequestedBudgetCard'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

export default function ProposalBudget({ proposal, budget }: Props) {
  return (
    <ContentSection className="ProposalBudget__Content">
      <div className="ProposalBudget__Row">
        <RequestedBudgetCard proposal={proposal} budget={budget} />
        <CategoryTotalCard proposal={proposal} budget={budget} />
      </div>
    </ContentSection>
  )
}
