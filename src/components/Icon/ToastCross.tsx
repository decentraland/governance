import React from 'react'

import classNames from 'classnames'

function ToastCross({ className }: { className?: string }) {
  return (
    <svg
      className={classNames('ToastCross', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
    >
      <path
        opacity="0.2"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.59619 0.181981L0.18198 1.59619L3.36396 4.77818L0.18198 7.96016L1.59619 9.37437L4.77817 6.19239L7.96015 9.37437L9.37437 7.96016L6.19239 4.77818L9.37437 1.59619L7.96015 0.181981L4.77817 3.36396L1.59619 0.181981Z"
        fill="white"
      />
    </svg>
  )
}

export default ToastCross
