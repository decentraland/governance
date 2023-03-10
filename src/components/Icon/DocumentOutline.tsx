import React from 'react'

function DocumentOutline({
  className,
  size = 24,
  color = 'var(--black-800)',
}: {
  className?: string
  color?: string
  size?: number
}) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
      <path
        fill={color}
        d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6m0 2h7v5h5v11H6V4m2 8v2h8v-2H8m0 4v2h5v-2H8z"
      ></path>
    </svg>
  )
}

export default DocumentOutline
