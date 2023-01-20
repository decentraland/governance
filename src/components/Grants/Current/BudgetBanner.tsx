import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalGrantCategory } from '../../../entities/Grant/types'
import { PROPOSAL_GRANT_CATEGORY_ALL } from '../../../entities/Proposal/types'
import useBudgetByCategory from '../../../hooks/useBudgetByCategory'
import ProgressBar from '../../Common/ProgressBar'

import './BudgetBanner.css'
import BudgetBannerItem from './BudgetBannerItem'

interface Props {
  category: ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL
}

function BudgetBanner({ category }: Props) {
  const t = useFormatMessage()
  const { percentage, currentAmount, totalBudget, initiatives } = useBudgetByCategory(category)
  return (
    <div className="BudgetBanner">
      <BudgetBannerItem value={totalBudget} label={t('page.grants.budget_banner.budget_label')} />
      <BudgetBannerItem value={String(initiatives)} label={t('page.grants.budget_banner.progress_label')} />
      <div className="ProgressContainer">
        <ProgressBar
          height="6px"
          percentage={percentage}
          background="linear-gradient(270deg, #A524B3 -0.33%, #FF2D55 100%)"
        />
        <div className="ProgressContainer__Label">
          <div>
            <span>{t('page.grants.budget_banner.spent_label')}</span>
            <span className="Amount">{currentAmount}</span>
          </div>
          <div className="Percentage">{`${percentage}%`}</div>
        </div>
      </div>
    </div>
  )
}

export default BudgetBanner
