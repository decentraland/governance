import { useIntl } from 'react-intl'

import classNames from 'classnames'
import snakeCase from 'lodash/snakeCase'

import { ProjectStatus, SubtypeAlternativeOptions, SubtypeOptions, isGrantSubtype } from '../../../entities/Grant/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import { CategoryIconVariant } from '../../../helpers/styles'
import useBudgetByCategory from '../../../hooks/useBudgetByCategory'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { getCategoryIcon } from '../../Category/CategoryOption'
import ProgressBar from '../../Common/ProgressBar'

import './BudgetBanner.css'
import BudgetBannerItem from './BudgetBannerItem'

interface Props {
  category: SubtypeOptions
  status?: ProjectStatus | null
  initiativesCount?: number
}

export default function BudgetBanner({ category, status, initiativesCount }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const {
    allocatedPercentage: percentage,
    allocated: currentAmount,
    total: totalBudget,
  } = useBudgetByCategory(category)

  const showProgress = !status || status === ProjectStatus.InProgress

  return (
    <div className={classNames('BudgetBanner', !showProgress && 'BudgetBanner--start')}>
      <div className="BudgetBanner__LabelWithIcon">
        {category && (isGrantSubtype(category) || category === SubtypeAlternativeOptions.Legacy) && (
          <span>{getCategoryIcon(snakeCase(category), CategoryIconVariant.Circled, 48)}</span>
        )}
        <BudgetBannerItem
          value={intl.formatNumber(totalBudget, CURRENCY_FORMAT_OPTIONS as any)}
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
              <span className="BudgetBanner__Amount">
                {intl.formatNumber(currentAmount, CURRENCY_FORMAT_OPTIONS as any)}
              </span>
            </div>
            <div className="BudgetBanner__Percentage">{`${percentage}%`}</div>
          </div>
        </div>
      )}
    </div>
  )
}
