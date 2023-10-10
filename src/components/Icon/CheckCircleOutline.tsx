export default function CheckCircleOutline({
  className,
  size = '14',
}: {
  size?: string
  className?: string
  outline?: boolean
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 14 14"
    >
      <circle cx="7" cy="7" r="6" stroke="#44B600" strokeWidth="2"></circle>
      <path stroke="#44B600" strokeWidth="2" d="M4 7l2 2 4-4"></path>
    </svg>
  )
}
