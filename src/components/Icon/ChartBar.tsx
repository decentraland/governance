function ChartBar({
  className,
  size = 24,
  color = 'var(--black-800)',
}: {
  className?: string
  color?: string
  size?: number
}) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
      <path fill={color} d="M22 21H2V3h2v16h2v-9h4v9h2V6h4v13h2v-5h4v7z"></path>
    </svg>
  )
}

export default ChartBar
