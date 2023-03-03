import React from 'react'

import { BudgetBreakdownItem as BudgetBreakdownItemType } from '../../entities/Grant/types'
import CloseCircle from '../Icon/CloseCircle'

import './BudgetBreakdownItem.css'

interface Props {
  item: BudgetBreakdownItemType
  onDeleteClick: () => void
}

const BUDGET_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

const BudgetBreakdownItem = ({ item, onDeleteClick }: Props) => {
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
        <button className="BudgetBreakdownItem__DeleteButton" onClick={onDeleteClick}>
          <CloseCircle />
        </button>
      </div>
    </div>
  )
}

export default BudgetBreakdownItem
