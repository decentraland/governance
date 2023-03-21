import React from 'react'
import Skeleton from 'react-loading-skeleton'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { getFormattedPercentage } from '../../../helpers'

import './ContestedBudgetBar.css'
import DistributionBarItem, { DistributionBarItemProps } from './DistributionBarItem'

interface Props {
  total: number
  isLoading?: boolean
  className?: string
  showPopups?: boolean
  allocatedBudgetItem: DistributionBarItemProps
  availableOverBudgetItem?: DistributionBarItemProps
  contestingProposalsItems: DistributionBarItemProps[]
  requestedBudgetItem: DistributionBarItemProps
  uncontestedTotalBudgetItem?: DistributionBarItemProps
}

const ContestedBudgetBar = ({
  allocatedBudgetItem,
  availableOverBudgetItem,
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
            <DistributionBarItem item={allocatedBudgetItem} total={total} showPopup={showPopups} />
            {contestingProposalsItems.map((item, index) => (
              <DistributionBarItem
                key={`distribution-bar-item-${index}`}
                item={item}
                total={total}
                showPopup={showPopups}
              />
            ))}
            <DistributionBarItem item={requestedBudgetItem} total={total} showPopup={showPopups} />
            {uncontestedTotalBudgetItem && (
              <DistributionBarItem item={uncontestedTotalBudgetItem} total={total} showPopup={showPopups} />
            )}
          </>
        )}
      </div>
      {availableOverBudgetItem && (
        <div className={'HiddenDistributionBar'}>
          <>
            <div
              className={'TransparentBar'}
              style={{ width: getFormattedPercentage(allocatedBudgetItem.value, total) }}
            />
            <DistributionBarItem item={availableOverBudgetItem} total={total} />
          </>
        </div>
      )}
    </div>
  )
}

export default ContestedBudgetBar
