function Warning({ className, size = '32' }: { size?: string; className?: string }) {
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
      <circle cx="16" cy="16" r="16" fill="#FFBC5B"></circle>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M18 9a2 2 0 10-4 0v8a2 2 0 104 0V9zm-2 16a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Warning
