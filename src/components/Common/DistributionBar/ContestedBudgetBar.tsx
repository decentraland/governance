import React from 'react'
import Skeleton from 'react-loading-skeleton'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './ContestedBudgetBar.css'
import DistributionBarItem, { DistributionBarItemProps } from './DistributionBarItem'

interface Props {
  total: number
  isLoading?: boolean
  className?: string
  showPopups?: boolean
  allocatedBudgetItem: DistributionBarItemProps
  availableOverBudget?: DistributionBarItemProps
  contestingProposalsItems: DistributionBarItemProps[]
  requestedBudgetItem: DistributionBarItemProps
  uncontestedTotalBudgetItem?: DistributionBarItemProps
}

const ContestedBudgetBar = ({
  allocatedBudgetItem,
  availableOverBudget,
  contestingProposalsItems,
  requestedBudgetItem,
  uncontestedTotalBudgetItem,
  total,
  isLoading,
  showPopups = true,
  className,
}: Props) => {
  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className={TokenList.join(['DistributionBar', 'DistributionBar__Loading'])} />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={TokenList.join(['DistributionBar', total <= 0 && 'DistributionBar--empty'])}>
        {total > 0 && (
          <>
            <DistributionBarItem
              key={`distribution-bar-item-allocated`}
              value={allocatedBudgetItem.value}
              total={total}
              popupContent={showPopups ? allocatedBudgetItem.popupContent : undefined}
              className={allocatedBudgetItem.className}
              selected={allocatedBudgetItem.selected}
              onHover={allocatedBudgetItem.onHover}
              onBlur={allocatedBudgetItem.onBlur}
            />
            {contestingProposalsItems.map(({ value, popupContent, className, selected, onHover, onBlur }, index) => (
              <DistributionBarItem
                key={`distribution-bar-item-${index}`}
                value={value}
                total={total}
                popupContent={showPopups ? popupContent : undefined}
                className={className}
                selected={selected}
                onHover={onHover}
                onBlur={onBlur}
              />
            ))}
            <DistributionBarItem
              key={`distribution-bar-item-requested`}
              value={requestedBudgetItem.value}
              total={total}
              popupContent={showPopups ? requestedBudgetItem.popupContent : undefined}
              className={requestedBudgetItem.className}
              selected={requestedBudgetItem.selected}
              onHover={requestedBudgetItem.onHover}
              onBlur={requestedBudgetItem.onBlur}
            />
            {uncontestedTotalBudgetItem && (
              <DistributionBarItem
                key={`distribution-bar-item-uncontested`}
                value={uncontestedTotalBudgetItem.value}
                total={total}
                popupContent={showPopups ? uncontestedTotalBudgetItem.popupContent : undefined}
                className={uncontestedTotalBudgetItem.className}
                selected={uncontestedTotalBudgetItem.selected}
                onHover={uncontestedTotalBudgetItem.onHover}
                onBlur={uncontestedTotalBudgetItem.onBlur}
              />
            )}
          </>
        )}
      </div>
      {availableOverBudget && (
        <div className={TokenList.join(['DistributionBar', 'HiddenDistributionBar'])}>
          <>
            <DistributionBarItem
              key={`distribution-bar-item-allocated`}
              value={allocatedBudgetItem.value}
              total={total}
              popupContent={showPopups ? allocatedBudgetItem.popupContent : undefined}
              className={TokenList.join([allocatedBudgetItem.className, 'TransparentBar'])}
              selected={allocatedBudgetItem.selected}
              onHover={allocatedBudgetItem.onHover}
              onBlur={allocatedBudgetItem.onBlur}
            />
            <DistributionBarItem
              key={`distribution-bar-item-available`}
              value={availableOverBudget.value}
              total={total}
              popupContent={showPopups ? availableOverBudget.popupContent : undefined}
              className={availableOverBudget.className}
              selected={availableOverBudget.selected}
              onHover={availableOverBudget.onHover}
              onBlur={availableOverBudget.onBlur}
            />
          </>
        </div>
      )}
    </div>
  )
}

export default ContestedBudgetBar
