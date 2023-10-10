import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import times from 'lodash/times'

import './SkeletonBars.css'

interface Props {
  height: number
  amount: number
  width?: string | number
  enableAnimation?: boolean
}

function SkeletonBars({ amount, height, width, enableAnimation }: Props) {
  const bars = times(amount, (i) => (
    <Skeleton
      className="SkeletonBar"
      key={`item-${i}`}
      height={height}
      width={width}
      enableAnimation={enableAnimation}
    />
  ))
  return <>{bars}</>
}

export default SkeletonBars
