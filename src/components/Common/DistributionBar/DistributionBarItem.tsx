import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

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
type Props = DistributionBarItemProps & { total: number }

const DistributionBarItem = ({ value, className, selected, total, popupContent, onHover, onBlur }: Props) => {
  if (value <= 0) {
    return null
  }

  return (
    <>
      {popupContent ? (
        <DistributionBarPopup popupContent={popupContent} open={selected}>
          <div
            className={TokenList.join([
              'DistributionBarItem',
              !!selected && 'DistributionBarItem--selected',
              className,
              !!selected && `${className}--selected`,
            ])}
            style={{ width: getFormattedPercentage(value, total) }}
            onMouseEnter={onHover}
            onMouseLeave={onBlur}
          />
        </DistributionBarPopup>
      ) : (
        <div
          className={TokenList.join([
            'DistributionBarItem',
            !!selected && 'DistributionBarItem--selected',
            className,
          ])}
          style={{ width: getFormattedPercentage(value, total) }}
          onMouseEnter={onHover}
          onMouseLeave={onBlur}
        />
      )}
    </>
  )
}

export default DistributionBarItem
