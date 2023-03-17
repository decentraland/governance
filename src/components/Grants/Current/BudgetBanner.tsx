import React, { useMemo } from 'react'

import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import snakeCase from 'lodash/snakeCase'

import { GrantStatus, ProposalGrantCategory } from '../../../entities/Grant/types'
import { PROPOSAL_GRANT_CATEGORY_ALL } from '../../../entities/Proposal/types'
import { CategoryIconVariant } from '../../../helpers/styles'
import useBudgetByCategory from '../../../hooks/useBudgetByCategory'
import { getCategoryIcon } from '../../Category/CategoryOption'
import ProgressBar from '../../Common/ProgressBar'
import { Counter } from '../../Search/CategoryFilter'

import './BudgetBanner.css'
import BudgetBannerItem from './BudgetBannerItem'

interface Props {
  category: ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL
  status?: GrantStatus | null
  counter?: Counter
}

function getAllInitiativesCount(counter: Counter) {
  return Object.values(counter).reduce((acc, curr) => acc + curr, 0)
}

const currencyFormatter: any = {
  class: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

function BudgetBanner({ category, status, counter }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const {
    allocatedPercentage: percentage,
    allocated: currentAmount,
    total: totalBudget,
  } = useBudgetByCategory(category)

  const initiativesCount = useMemo(
    () =>
      (counter && (category !== PROPOSAL_GRANT_CATEGORY_ALL ? counter[category] : getAllInitiativesCount(counter))) ||
      0,
    [category, counter]
  )
  const showProgress = !status || status === GrantStatus.InProgress
  return (
    <div className={TokenList.join(['BudgetBanner', !showProgress && 'BudgetBanner--start'])}>
      <div className="BudgetBanner__LabelWithIcon">
        {category !== PROPOSAL_GRANT_CATEGORY_ALL && (
          <span>{getCategoryIcon(snakeCase(category), CategoryIconVariant.Circled, 48)}</span>
        )}
        <BudgetBannerItem
          value={`$${intl.formatNumber(totalBudget, currencyFormatter)}`}
          label={t('page.grants.budget_banner.budget_label')}
        />
      </div>
      <BudgetBannerItem
        value={String(initiativesCount)}
        label={`${t('page.grants.budget_banner.progress_label')}${status ? ` ${status.toLowerCase()}` : ''}`}
      />
      {showProgress && (
        <div className="BudgetBanner__ProgressContainer">
          <ProgressBar
            height="6px"
            percentage={percentage}
            background="linear-gradient(270deg, #A524B3 -0.33%, #FF2D55 100%)"
          />
          <div className="BudgetBannerItem__Label">
            <div>
              <span>{t('page.grants.budget_banner.spent_label')}</span>
              <span className="BudgetBanner__Amount">${intl.formatNumber(currentAmount, currencyFormatter)}</span>
            </div>
            <div className="BudgetBanner__Percentage">{`${percentage}%`}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetBanner
