import React from 'react'

function Cross({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.4644 0.0502526L0.0501823 1.46447L3.58572 5L0.0501823 8.53553L1.4644 9.94975L4.99993 6.41421L8.53546 9.94975L9.94968 8.53553L6.41414 5L9.94968 1.46447L8.53546 0.0502526L4.99993 3.58579L1.4644 0.0502526Z"
        fill="#736E7D"
      />
    </svg>
  )
}

export default Cross
