import React from 'react'

import { Desktop } from 'decentraland-ui/dist/components/Media/Media'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes, ProposalStatus } from '../../../../entities/Proposal/types'
import { ContentSection } from '../../../Layout/ContentLayout'

import CategoryTotalCard from './CategoryTotalCard'
import CompetingGrants from './CompetingGrants'
import './ProposalBudget.css'
import RequestedBudgetCard from './RequestedBudgetCard'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

export default function ProposalBudget({ proposal, budget }: Props) {
  const grantCategory = proposal.configuration.category
  const contestantsAmount = (budget.categories[snakeCase(grantCategory)]?.contestants.length || 0) - 1
  const isActive = proposal.status === ProposalStatus.Active

  return (
    <ContentSection>
      <div className="ProposalBudget__Row">
        <RequestedBudgetCard proposal={proposal} budget={budget} />
        <CategoryTotalCard proposal={proposal} budget={budget} />
      </div>
      <Desktop>
        {contestantsAmount > 0 && isActive && (
          <div className="ProposalBudget__Row">
            <CompetingGrants proposal={proposal} budget={budget} />
          </div>
        )}
      </Desktop>
    </ContentSection>
  )
}
