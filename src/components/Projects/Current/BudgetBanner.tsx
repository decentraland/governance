import { useIntl } from 'react-intl'

import classNames from 'classnames'
import toSnakeCase from 'lodash/snakeCase'

import {
  NewGrantCategory,
  ProjectStatus,
  SubtypeAlternativeOptions,
  SubtypeOptions,
  isGrantSubtype,
} from '../../../entities/Grant/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import { CategoryIconVariant } from '../../../helpers/styles'
import useBudgetByCategory from '../../../hooks/useBudgetByCategory'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useYearAndQuarterParams from '../../../hooks/useYearAndQuarterParams'
import ProgressBar from '../../Common/ProgressBar'
import { getNewGrantsCategoryIcon } from '../../Icon/NewGrantsCategoryIcons'

import './BudgetBanner.css'
import BudgetBannerItem from './BudgetBannerItem'

interface Props {
  category: SubtypeOptions
  status?: ProjectStatus | null
  initiativesCount?: number
}

export const getNewGrantIcon = (type: string, variant?: CategoryIconVariant, size?: number) => {
  const newGrants = Object.values(NewGrantCategory)
  const newGrantIndex = newGrants.map(toSnakeCase).indexOf(type)
  const isNewGrant = newGrantIndex !== -1
  if (isNewGrant) {
    const icon = getNewGrantsCategoryIcon(newGrants[newGrantIndex])
    return icon({ variant: variant || CategoryIconVariant.Filled, size: size })
  }

  return <></>
}

export default function BudgetBanner({ category, status, initiativesCount }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const { year, quarter } = useYearAndQuarterParams()
  const isYearAndQuarterValid = year && quarter
  const {
    allocatedPercentage: percentage,
    allocated: currentAmount,
    total: totalBudget,
  } = useBudgetByCategory(category, year, quarter)

  const showProgress = !status || status === ProjectStatus.InProgress

  return (
    <div className={classNames('BudgetBanner', !showProgress && 'BudgetBanner--start')}>
      <div className="BudgetBanner__LabelWithIcon">
        {category && (isGrantSubtype(category) || category === SubtypeAlternativeOptions.Legacy) && (
          <span>{getNewGrantIcon(toSnakeCase(category), CategoryIconVariant.Circled, 48)}</span>
        )}
        <BudgetBannerItem
          value={intl.formatNumber(totalBudget, CURRENCY_FORMAT_OPTIONS)}
          label={`${isYearAndQuarterValid ? t('page.grants.quarter_and_year', { quarter, year }) + ' ' : ''}${t(
            'page.grants.budget_banner.budget_label'
          )}`}
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
              <span className="BudgetBanner__Amount">{intl.formatNumber(currentAmount, CURRENCY_FORMAT_OPTIONS)}</span>
            </div>
            <div className="BudgetBanner__Percentage">{`${percentage}%`}</div>
          </div>
        </div>
      )}
    </div>
  )
}
