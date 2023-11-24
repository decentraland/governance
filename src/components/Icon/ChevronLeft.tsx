interface Props {
  className?: string
  color?: string
}

function ChevronLeft({ className, color = 'var(--black-800)' }: Props) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="8" height="14" fill="none" viewBox="0 0 8 14">
      <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 13L1 7l6-6"></path>
    </svg>
  )
}

export default ChevronLeft
