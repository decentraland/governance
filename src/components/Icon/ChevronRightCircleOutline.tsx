import classNames from 'classnames'

import './ChevronRightCircleOutline.css'

interface Props {
  resizable?: boolean
  size?: number
  className?: string
}

function ChevronRightCircleOutline({ className, resizable, size = 24 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0"
      y="0"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className={classNames(!resizable && 'ChevronRightCircleOutline__FixedSize', className)}
    >
      <clipPath id="clip-path-202210-0615-2828-02987f6e-2a6a-4a00-87b8-69dcd369a988">
        <circle cx="50" cy="50" r="50" stroke="#FFFFFF" className="svg-fill-white"></circle>
      </clipPath>
      <g
        clipPath="url(#clip-path-202210-0615-2828-02987f6e-2a6a-4a00-87b8-69dcd369a988)"
        transform="translate(0.00, 0.00) scale(1.00, 1.00)"
        className="ChevronRightCircleOutline__Circle"
      >
        <circle stroke="#16141A40" strokeWidth="8" className="svg-fill-white" cx="50" cy="50" r="50"></circle>
      </g>
      <g transform="translate(30.00, 22.50) scale(0.55, 0.55)">
        <path
          d="M27.7,13.4,64.3,50,27.7,86.6"
          fill="none"
          className="svg-stroke-black"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
      </g>
    </svg>
  )
}

export default ChevronRightCircleOutline
