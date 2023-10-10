import { useState } from 'react'

import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import CompetingButton from '../CompetingButton'

import CompetingProposalsSidebar from './CompetingProposalsSidebar'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

export default function CompetingGrants({ proposal, budget }: Props) {
  const t = useFormatMessage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const grantCategory = proposal.configuration.category
  const contestantsAmount = (budget.categories[snakeCase(grantCategory)]?.contestants.length || 0) - 1

  if (!contestantsAmount || contestantsAmount < 1) return null

  return (
    <>
      <CompetingButton onClick={() => setSidebarOpen(true)}>
        {t('page.proposal_detail.grant.competing_proposals.show_sidebar_label', { amount: contestantsAmount })}
      </CompetingButton>
      <CompetingProposalsSidebar
        proposal={proposal}
        budget={budget}
        isSidebarVisible={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false)
        }}
      />
    </>
  )
}
