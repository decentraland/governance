import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import times from 'lodash/times'

import './SkeletonBars.css'

interface Props {
  height: number
  amount: number
}

function SkeletonBars({ amount, height }: Props) {
  const bars = times(amount, (i) => <Skeleton className="SkeletonBar" key={`item-${i}`} height={height} />)
  return <>{bars}</>
}

export default SkeletonBars
