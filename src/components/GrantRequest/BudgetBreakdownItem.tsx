import React from 'react'

import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './BudgetBreakdownItem.css'
import { BudgetBreakdownItem as BudgetBreakdownItemType } from './GrantRequestDueDilligenceSection'

interface Props {
  item: BudgetBreakdownItemType
}

const BudgetBreakdownItem = ({ item }: Props) => {
  return (
    <div className="BudgetBreakdownItem">
      <div>
        <h3 className="BudgetBreakdownItem__Concept">{item.concept}</h3>
        <span className="BudgetBreakdownItem__Duration">6 months</span>
      </div>
      <div className="BudgetBreakdownItem__BudgetContainer">
        <span className="BudgetBreakdownItem__Budget">$140,000</span>
        <ChevronRightCircleOutline />
      </div>
    </div>
  )
}

export default BudgetBreakdownItem
