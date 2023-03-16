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

  //TODO: internationalization
  return (
    <div className={'CompetingProposals'} onClick={() => setSidebarOpen(true)}>
      <span
        className={'CompetingProposals__Title'}
      >{`This proposal is competing with ${contestantsAmount} others for funds`}</span>
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
