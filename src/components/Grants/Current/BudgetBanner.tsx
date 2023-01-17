import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import ProgressBar from '../../Common/ProgressBar'

import './BudgetBanner.css'
import BudgetBannerItem from './BudgetBannerItem'

function BudgetBanner() {
  const t = useFormatMessage()
  const percentage = 45
  return (
    <div className="BudgetBanner">
      <BudgetBannerItem value="$3.5 million" label={t('page.grants.budget_banner.budget_label')} />
      <BudgetBannerItem value="22" label={t('page.grants.budget_banner.progress_label')} />
      <div className="ProgressContainer">
        <ProgressBar
          height="6px"
          percentage={percentage}
          background="linear-gradient(270deg, #A524B3 -0.33%, #FF2D55 100%)"
        />
        <div className="ProgressContainer__Label">
          <div>
            <span>{t('page.grants.budget_banner.spent_label')}</span>
            <span className="Amount">$44,444,444</span>
          </div>
          <div className="Percentage">{`${percentage}%`}</div>
        </div>
      </div>
    </div>
  )
}

export default BudgetBanner
