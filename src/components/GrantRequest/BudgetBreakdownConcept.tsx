import React from 'react'

import { BudgetBreakdownConcept as BudgetBreakdownConceptType } from '../../entities/Grant/types'
import CloseCircle from '../Icon/CloseCircle'

import './BudgetBreakdownConcept.css'

interface Props {
  item: BudgetBreakdownConceptType
  onDeleteClick: () => void
}

const BUDGET_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

const BudgetBreakdownConcept = ({ item, onDeleteClick }: Props) => {
  const { concept, estimatedBudget, duration } = item

  return (
    <div className="BudgetBreakdownConcept">
      <div>
        <h3 className="BudgetBreakdownConcept__Concept">{concept}</h3>
        <span className="BudgetBreakdownConcept__Duration">{duration} months</span>
      </div>
      <div className="BudgetBreakdownConcept__BudgetContainer">
        <span className="BudgetBreakdownConcept__Budget">
          {Number(estimatedBudget).toLocaleString(undefined, BUDGET_FORMAT_OPTIONS)}
        </span>
        <button className="BudgetBreakdownConcept__DeleteButton" onClick={onDeleteClick}>
          <CloseCircle />
        </button>
      </div>
    </div>
  )
}

export default BudgetBreakdownConcept
