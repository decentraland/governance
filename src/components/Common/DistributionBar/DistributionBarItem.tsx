import classNames from 'classnames'

import { getFormattedPercentage } from '../../../helpers'

import './DistributionBarItem.css'
import DistributionBarPopup, { DistributionBarPopupContent } from './DistributionBarPopup'

export type DistributionBarItemProps = {
  popupContent?: DistributionBarPopupContent
  value: number
  className: string
  selected?: boolean
  onHover?: (e: React.MouseEvent<unknown>) => void
  onBlur?: () => void
}
type Props = { item: DistributionBarItemProps; total: number; showPopup?: boolean }

const DistributionBarItem = ({ item, total, showPopup }: Props) => {
  const { value, className, selected, popupContent, onHover, onBlur } = item

  if (value <= 0) {
    return null
  }

  const horizontalBar = (
    <div
      className={classNames(
        'DistributionBarItem',
        !!selected && 'DistributionBarItem--selected',
        className,
        !!selected && `${className}--selected`
      )}
      style={{ width: getFormattedPercentage(value, total) }}
      onMouseEnter={onHover}
      onMouseLeave={onBlur}
    />
  )

  return (
    <>
      {!!showPopup && popupContent ? (
        <DistributionBarPopup popupContent={popupContent} open={selected}>
          {horizontalBar}
        </DistributionBarPopup>
      ) : (
        horizontalBar
      )}
    </>
  )
}

export default DistributionBarItem
