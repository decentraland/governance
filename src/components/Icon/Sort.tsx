import React from 'react'

type SortProps = {
  rotate?: number
}

function Sort({ rotate = 0 }: SortProps) {
  return (
    <svg
      width="5"
      height="3"
      viewBox="0 0 5 3"
      fill="none"
      transform={`rotate(${rotate})`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.5 2.5L0 0H5L2.5 2.5Z" fill="#736E7D" />
    </svg>
  )
}

export default Sort
