import React from 'react'

function Minus({ className, size = '32' }: { size?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="#726E7C" />
      <rect x="6.79999" y="14.4" width="18.4" height="3.2" rx="1.6" fill="#D9D9D9" />
    </svg>
  )
}

export default Minus
