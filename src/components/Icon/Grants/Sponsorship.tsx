import React from 'react'

import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function Sponsorship({ variant = CategoryIconVariant.Normal, size = 42 }: CategoryIconProps) {
  const primaryColor = getCategoryIconPrimaryColor('orange', variant)
  const secondaryColor = getCategoryIconSecondaryColor('orange', variant)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="-5 -10 52 52">
      <rect width="4" height="31" x="34.272" fill={primaryColor} rx="2"></rect>
      <path
        fill={primaryColor}
        fillRule="evenodd"
        d="M16.771 30a6.5 6.5 0 100-13 6.5 6.5 0 000 13zm0-3a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        clipRule="evenodd"
      ></path>
      <path
        fill={secondaryColor}
        fillRule="evenodd"
        d="M32.272 3l-28 8a2 2 0 10-4 0v9a2 2 0 104 0l28 8V3z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Sponsorship
