import React from 'react'

import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { isDevEnv } from '../../../../modules/env'
import { ContentSection } from '../../../Layout/ContentLayout'

import CategoryTotalCard from './CategoryTotalCard'
import CompetingProposals from './CompetingProposals'
import './ProposalBudget.css'
import RequestedBudgetCard from './RequestedBudgetCard'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

const COMPETING_PROPOSALS_FEATURE_ENABLED = isDevEnv()

export default function ProposalBudget({ proposal, budget }: Props) {
  const grantCategory = proposal.configuration.category
  const contestantsAmount = (budget.categories[snakeCase(grantCategory)]?.contestants.length || 0) - 1

  return (
    <ContentSection className="ProposalBudget__Content">
      <div className="ProposalBudget__Row">
        <RequestedBudgetCard proposal={proposal} budget={budget} />
        <CategoryTotalCard proposal={proposal} budget={budget} />
      </div>
      {COMPETING_PROPOSALS_FEATURE_ENABLED && contestantsAmount > 0 && (
        <div className="ProposalBudget__Row">
          <CompetingProposals proposal={proposal} budget={budget} />
        </div>
      )}
    </ContentSection>
  )
}
