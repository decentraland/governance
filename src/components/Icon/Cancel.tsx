function Cancel({ className, size = '32' }: { size?: string; className?: string }) {
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
      <circle cx="16" cy="16" r="16" fill="#D80027"></circle>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M9.252 20.09a2 2 0 102.829 2.83L16 19l3.918 3.92a2 2 0 002.829-2.83l-3.92-3.919 3.758-3.757a2 2 0 10-2.829-2.828L16 13.343l-3.757-3.757a2 2 0 10-2.828 2.828l3.757 3.757-3.92 3.92z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Cancel
