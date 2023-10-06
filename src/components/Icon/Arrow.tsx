import classNames from 'classnames'

type ArrowProps = {
  filled: boolean
  className?: string
  color?: string
}

function Arrow({ filled, className, color = 'var(--black-400)' }: ArrowProps) {
  const fill = filled ? color : 'transparent'
  const stroke = filled ? 'white' : color

  return (
    <svg
      className={classNames('Arrow', className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="8" fill={fill} />
      <path d="M6 4L10 8L6 12" stroke={stroke} strokeWidth="2" />
    </svg>
  )
}

export default Arrow
