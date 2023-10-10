function OutlineDots({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="12" fill="var(--black-600)" transform="rotate(-180 12 12)"></circle>
      <circle cx="8" cy="12" r="1" fill="var(--white-900)"></circle>
      <circle cx="12" cy="12" r="1" fill="var(--white-900)"></circle>
      <circle cx="16" cy="12" r="1" fill="var(--white-900)"></circle>
    </svg>
  )
}

export default OutlineDots
