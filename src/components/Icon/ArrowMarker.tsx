import classNames from 'classnames'

type Props = {
  className?: string
}

function ArrowMarker({ className }: Props) {
  return (
    <svg
      className={classNames('ArrowMarker', className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path opacity="0.5" d="M0 24L3 21L6 24H0Z" fill="#555555" />
      <path opacity="0.5" d="M6 0L3 3L2.62268e-07 -5.24537e-07L6 0Z" fill="#555555" />
    </svg>
  )
}

export default ArrowMarker
