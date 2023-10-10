import { getFormattedPercentage } from '../../../../helpers'
import { DistributionBarItemProps } from '../../../Common/DistributionBar/DistributionBarItem'
import ArrowMarker from '../../../Icon/ArrowMarker'

import './AvailableOverBudgetBar.css'

interface Props {
  allocatedBudget: number
  availableOverBudgetItem: DistributionBarItemProps
  total: number
}

export default function AvailableOverBudgetBar({ allocatedBudget, availableOverBudgetItem, total }: Props) {
  return (
    <div className="AvailableOverBudgetBar">
      <div
        className="AvailableOverBudgetBar__Allocated"
        style={{ width: getFormattedPercentage(allocatedBudget, total) }}
      />
      <div
        className={availableOverBudgetItem.className}
        style={{ width: getFormattedPercentage(availableOverBudgetItem.value, total) }}
      />
      <ArrowMarker className="AvailableOverBudgetBar__ArrowMarker" />
      <span className="AvailableOverBudgetBar__HundredPercent">100%</span>
    </div>
  )
}
