import React from 'react'

import { ExpectedBudget } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { ContentSection } from '../../../Layout/ContentLayout'

import CategoryTotalCard from './CategoryTotalCard'
import './ProposalBudget.css'
import RequestedBudgetCard from './RequestedBudgetCard'

interface Props {
  proposal: ProposalAttributes
  expectedBudget: ExpectedBudget
}

export default function ProposalBudget({ proposal, expectedBudget }: Props) {
  return (
    <ContentSection className="ProposalBudget__Content">
      <div className="ProposalBudget__Row">
        <RequestedBudgetCard proposal={proposal} expectedBudget={expectedBudget} />
        <CategoryTotalCard proposal={proposal} expectedBudget={expectedBudget} />
      </div>
    </ContentSection>
  )
}
