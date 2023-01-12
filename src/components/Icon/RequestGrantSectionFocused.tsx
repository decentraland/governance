import React from 'react'

interface Props {
  className?: string
}

function RequestGrantSectionFocused({ className }: Props) {
  return (
    <svg
      width="34"
      height="42"
      viewBox="0 0 34 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="21" r="16" fill="#16141A" />
      <path
        d="M12.7837 26H20.2104V24.4546H15.2812V24.374L17.6104 22.1621C19.4707 20.375 20.0493 19.5327 20.0493 18.2876V18.2729C20.0493 16.5298 18.5698 15.248 16.4531 15.248C14.3071 15.248 12.6812 16.6323 12.6812 18.5659V18.6172H14.4536V18.5659C14.4756 17.5479 15.2959 16.7642 16.4678 16.7642C17.4858 16.7642 18.1963 17.438 18.2036 18.3828V18.3975C18.2036 19.1812 17.9033 19.7158 16.519 21.0708L12.7837 24.7109V26Z"
        fill="white"
      />
    </svg>
  )
}

export default RequestGrantSectionFocused
