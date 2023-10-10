import { useMemo, useState } from 'react'

import { Close } from 'decentraland-ui/dist/components/Close/Close'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants, CategoryBudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { toNewGrantCategory } from '../../../../entities/QuarterCategoryBudget/utils'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import GovernanceSidebar from '../../../Sidebar/GovernanceSidebar'
import ProposalCard from '../ProposalCard'

import './CompetingProposalsSidebar.css'
import ContestedBudgetCard from './ContestedBudgetCard'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
  isSidebarVisible: boolean
  onClose: () => void
}

function getIsOverBudget(categoryBudget: CategoryBudgetWithContestants) {
  const contestedBudget = categoryBudget.contested || 0
  const availableBudget = categoryBudget?.available || 0
  const uncontestedTotalBudget = availableBudget - contestedBudget
  const isOverBudget = uncontestedTotalBudget < 0
  return isOverBudget
}

export default function CompetingProposalsSidebar({ proposal, budget, isSidebarVisible, onClose }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const categoryBudget = budget.categories[snakeCase(grantCategory)]
  const isOverBudget = useMemo(() => getIsOverBudget(categoryBudget), [categoryBudget])
  const contestants = categoryBudget.contestants.filter((contestant) => contestant.id !== proposal.id)
  const [highlightedContestant, setHighlightedContestant] = useState<string | null>(null)
  const [showPopups, setShowPopups] = useState(false)

  return (
    <GovernanceSidebar
      onClose={onClose}
      onShow={() => {
        setShowPopups(true)
      }}
      onHide={() => {
        setShowPopups(false)
      }}
      visible={isSidebarVisible}
    >
      <div className="CompetingProposalsSidebar__Content">
        <div className="CompetingProposalsSidebar__TitleContainer">
          <span className="CompetingProposalsSidebar__Title">
            {t('page.proposal_detail.grant.competing_proposals.sidebar.title', {
              category: toNewGrantCategory(grantCategory),
            })}
          </span>
          <Close onClick={onClose} />
        </div>
        <ContestedBudgetCard
          proposal={proposal}
          categoryBudget={categoryBudget}
          highlightedContestant={highlightedContestant}
          setHighlightedContestant={setHighlightedContestant}
          showPopups={showPopups}
        />
      </div>

      <div className="CompetingProposalsSidebar__Content">
        <div className="CompetingProposalsSidebar__TitleContainer">
          <span className="CompetingProposalsSidebar__Title">
            {t('page.proposal_detail.grant.competing_proposals.sidebar.other_initiatives_title', {
              category: toNewGrantCategory(grantCategory),
            })}
          </span>
        </div>

        {contestants.map((contestant) => (
          <div
            className="CompetingProposalsSidebar__CardRow"
            key={`contestant-${contestant.id}`}
            onMouseEnter={() => setHighlightedContestant(contestant.id)}
            onMouseLeave={() => setHighlightedContestant(null)}
          >
            <ProposalCard
              proposal={contestant}
              highlight={highlightedContestant === contestant.id}
              isOverBudget={isOverBudget}
            />
          </div>
        ))}
      </div>
    </GovernanceSidebar>
  )
}
