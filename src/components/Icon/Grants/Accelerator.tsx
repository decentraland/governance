import React from 'react'

import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function Accelerator({ variant = CategoryIconVariant.Normal, size = 42 }: CategoryIconProps) {
  const primaryColor = getCategoryIconPrimaryColor('green', variant)
  const secondaryColor = getCategoryIconSecondaryColor('green', variant)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="-5 -5 52 52">
      <path
        fill={secondaryColor}
        fillRule="evenodd"
        d="M7.223 35h1.5a3.5 3.5 0 003.5-3.5 1.5 1.5 0 00-1.5-1.5 3.5 3.5 0 00-3.5 3.5V35zm3.5-10a8.5 8.5 0 00-8.5 8.5v6.071c0 .237.192.429.428.429h6.072a8.5 8.5 0 008.5-8.5 6.5 6.5 0 00-6.5-6.5z"
        clipRule="evenodd"
      ></path>
      <path
        fill={secondaryColor}
        d="M24.3 10.544A2 2 0 0022.93 10H8.37a2 2 0 00-1.727.992l-4.667 8C1.2 20.326 2.161 22 3.705 22h14.518a2 2 0 012 2v14.518c0 1.544 1.674 2.505 3.007 1.727l8-4.666a2 2 0 00.993-1.728V18.864a2 2 0 00-.63-1.456L24.3 10.544z"
      ></path>
      <path
        fill={primaryColor}
        fillRule="evenodd"
        d="M20.223 31v.852C29.67 27.238 41.98 20.829 41.98 9.818V4.273C41.98 2 40.223 0 37.85 0h-6.305C21.183 0 15.07 12.588 10.695 22h.528a9 9 0 019 9zm11.5-19a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Accelerator
