import React from 'react'

function ValidatedProfile({ className }: { className?: string }) {
  return (
    <svg className={className} width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.5 0C0.672656 0 0 0.672656 0 1.5V10.5C0 11.3273 0.672656 12 1.5 12H7.5C8.32734 12 9 11.3273 9 10.5V1.5C9 0.672656 8.32734 0 7.5 0H1.5ZM3.75 7.5H5.25C6.28594 7.5 7.125 8.33906 7.125 9.375C7.125 9.58125 6.95625 9.75 6.75 9.75H2.25C2.04375 9.75 1.875 9.58125 1.875 9.375C1.875 8.33906 2.71406 7.5 3.75 7.5ZM3 5.25C3 4.85218 3.15804 4.47064 3.43934 4.18934C3.72064 3.90804 4.10218 3.75 4.5 3.75C4.89782 3.75 5.27936 3.90804 5.56066 4.18934C5.84196 4.47064 6 4.85218 6 5.25C6 5.64782 5.84196 6.02936 5.56066 6.31066C5.27936 6.59196 4.89782 6.75 4.5 6.75C4.10218 6.75 3.72064 6.59196 3.43934 6.31066C3.15804 6.02936 3 5.64782 3 5.25ZM3.375 1H5.625C5.83125 1 6 1.29375 6 1.5C6 1.70625 5.83125 2 5.625 2H3.375C3.16875 2 3 1.70625 3 1.5C3 1.29375 3.16875 1 3.375 1Z"
        fill="url(#paint0_linear_10713_3365)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_10713_3365"
          x1="8.50641"
          y1="-0.00663861"
          x2="-0.00616541"
          y2="12.0634"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C640CD" />
          <stop offset="1" stopColor="#314ADE" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default ValidatedProfile
