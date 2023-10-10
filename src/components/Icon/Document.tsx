function Document({
  className,
  size = 24,
  color = 'var(--black-800)',
}: {
  className?: string
  color?: string
  size?: number
}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <path
        fill={color}
        d="M4 4v18h16v2H4c-1.1 0-2-.9-2-2V4h2m11 3h5.5L15 1.5V7M8 0h8l6 6v12c0 1.11-.89 2-2 2H8a2 2 0 01-2-2V2c0-1.11.89-2 2-2m9 16v-2H8v2h9m3-4v-2H8v2h12z"
      ></path>
    </svg>
  )
}

export default Document
