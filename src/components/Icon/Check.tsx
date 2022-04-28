import React from 'react'

function Check({ className, size = '32' }: { size?: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="#44B600"></circle>
      <path
        fill="#fff"
        d="M14.95 20.947a1.697 1.697 0 01-2.437 0l-3.998-3.998a1.697 1.697 0 010-2.436 1.697 1.697 0 012.436 0l2.811 2.749 6.747-6.747a1.697 1.697 0 012.436 0 1.697 1.697 0 010 2.436l-7.996 7.996z"
      ></path>
    </svg>
  )
}

export default Check
