import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

type ArrowProps = {
  filled: boolean
  className?: string
}

function Arrow({ filled, className }: ArrowProps) {
  const fill = filled ? 'var(--black-400)' : 'white'
  const stroke = filled ? 'white' : 'var(--black-400)'

  return (
    <svg
      className={TokenList.join(['Arrow', className])}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="8" fill={fill} />
      <path d="M6 4L10 8L6 12" stroke={stroke} strokeWidth="2" />
    </svg>
  )
}

export default Arrow
