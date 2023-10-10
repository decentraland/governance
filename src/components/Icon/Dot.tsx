interface Props {
  className?: string
  size?: number
  hexColor?: string
}

function Dot({ className, size = 8, hexColor = '#FF2D55' }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 5 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="2.5" cy="2.5" r="2.5" fill={hexColor} />
    </svg>
  )
}

export default Dot
