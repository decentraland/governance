import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import './SkeletonBars.css'

interface Props {
  height: number
  amount: number
}

function SkeletonBars({ amount, height }: Props) {
  // eslint-disable-next-line prefer-spread
  const bars = Array.apply(null, Array(amount)).map((_, i) => (
    <Skeleton className="SkeletonBar" key={`item-${i}`} height={height} />
  ))
  return <>{bars}</>
}

export default SkeletonBars
