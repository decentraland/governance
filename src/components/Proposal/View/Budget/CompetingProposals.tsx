import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import ChevronRightCircleOutline from '../../../Icon/ChevronRightCircleOutline'

import './CompetingProposals.css'
import CompetingProposalsSidebar from './CompetingProposalsSidebar'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

export default function CompetingProposals({ proposal, budget }: Props) {
  const t = useFormatMessage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const grantCategory = proposal.configuration.category
  const contestantsAmount = (budget.categories[snakeCase(grantCategory)]?.contestants.length || 0) - 1

  if (!contestantsAmount || contestantsAmount < 1) return null

  return (
    <div className={'CompetingProposals'} onClick={() => setSidebarOpen(true)}>
      <span className={'CompetingProposals__Title'}>
        {t('page.proposal_detail.grant.competing_proposals.show_sidebar_label', { amount: contestantsAmount })}
      </span>
      <ChevronRightCircleOutline />
      <CompetingProposalsSidebar
        proposal={proposal}
        budget={budget}
        isSidebarVisible={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false)
        }}
      />
    </div>
  )
}
