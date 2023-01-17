import React from 'react'

import './ProgressBar.css'

interface Props {
  percentage: number
  height: string
  background: string
}

function ProgressBar({ percentage, height, background }: Props) {
  const width = `${percentage < 0 ? 0 : percentage > 100 ? 100 : percentage}%`

  return (
    <div className="ProgressBar__Container" style={{ height }}>
      <div className="ProgressStatus" style={{ width, background }}></div>
    </div>
  )
}

export default ProgressBar
