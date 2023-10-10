function ChevronRight({ className, color }: { className?: string; color?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="8" height="14" fill="none" viewBox="0 0 8 14">
      <path
        fill={color || '#fff'}
        fillRule="evenodd"
        d="M8 7L1.621.772a.966.966 0 00-1.343 0 .912.912 0 000 1.31L5.314 7 .278 11.917a.912.912 0 000 1.311.966.966 0 001.343 0L8 7z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default ChevronRight
