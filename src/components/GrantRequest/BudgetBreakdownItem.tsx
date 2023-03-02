import React from 'react'

import { BudgetBreakdownItem as BudgetBreakdownItemType } from '../../entities/Grant/types'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './BudgetBreakdownItem.css'

interface Props {
  item: BudgetBreakdownItemType
}

const BUDGET_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

const BudgetBreakdownItem = ({ item }: Props) => {
  const { concept, estimatedBudget, duration } = item

  return (
    <div className="BudgetBreakdownItem">
      <div>
        <h3 className="BudgetBreakdownItem__Concept">{concept}</h3>
        <span className="BudgetBreakdownItem__Duration">{duration} months</span>
      </div>
      <div className="BudgetBreakdownItem__BudgetContainer">
        <span className="BudgetBreakdownItem__Budget">
          {Number(estimatedBudget).toLocaleString(undefined, BUDGET_FORMAT_OPTIONS)}
        </span>
        <ChevronRightCircleOutline />
      </div>
    </div>
  )
}

export default BudgetBreakdownItem
