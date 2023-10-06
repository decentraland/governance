import Skeleton from 'react-loading-skeleton'

import classNames from 'classnames'

import DistributionBarItem, { DistributionBarItemProps } from '../../../Common/DistributionBar/DistributionBarItem'

import AvailableOverBudgetBar from './AvailableOverBudgetBar'
import './ContestedBudgetDistributionBar.css'

interface Props {
  total: number
  isLoading?: boolean
  showPopups?: boolean
  allocatedBudgetItem: DistributionBarItemProps
  availableOverBudgetItem?: DistributionBarItemProps
  contestingProposalsItems: DistributionBarItemProps[]
  requestedBudgetItem: DistributionBarItemProps
  uncontestedTotalBudgetItem?: DistributionBarItemProps
}

const ContestedBudgetDistributionBar = ({
  allocatedBudgetItem,
  availableOverBudgetItem,
  contestingProposalsItems,
  requestedBudgetItem,
  uncontestedTotalBudgetItem,
  total,
  isLoading,
  showPopups = true,
}: Props) => {
  if (isLoading) {
    return (
      <div className="ContestedBudgetDistributionBar">
        <Skeleton className={classNames('DistributionBar', 'DistributionBar__Loading')} />
      </div>
    )
  }

  return (
    <div className="ContestedBudgetDistributionBar">
      <div className={classNames('DistributionBar', total <= 0 && 'DistributionBar--empty')}>
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
        <AvailableOverBudgetBar
          allocatedBudget={allocatedBudgetItem.value}
          availableOverBudgetItem={availableOverBudgetItem}
          total={total}
        />
      )}
    </div>
  )
}

export default ContestedBudgetDistributionBar
