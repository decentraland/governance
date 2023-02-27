import React from 'react'

import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function InWorldContent({ variant = CategoryIconVariant.Normal, size = 42 }: CategoryIconProps) {
  const primaryColor = getCategoryIconPrimaryColor('red', variant)
  const secondaryColor = getCategoryIconSecondaryColor('red', variant)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="-5 0 52 52">
      <circle cx="19.672" cy="19.672" r="14.5" fill={secondaryColor}></circle>
      <path
        fill={primaryColor}
        d="M40.184.586a2 2 0 00-2.829 0l-4.242 4.242a2 2 0 000 2.829l1.915 1.915c.11.11.207.233.287.366 4.255 7.106 3.32 16.452-2.802 22.575-6.123 6.123-15.47 7.056-22.576 2.801a1.9 1.9 0 01-.366-.287l-1.914-1.914a2 2 0 00-2.829 0L.586 37.355a2 2 0 000 2.829l.707.707a2 2 0 002.828 0L5 40.013c.68-.68 1.746-.77 2.577-.285a23.45 23.45 0 0010.596 3.17v3.274h-10a2 2 0 00-2 2v1a2 2 0 002 2h25a2 2 0 002-2v-1a2 2 0 00-2-2h-10v-3.538a23.393 23.393 0 0012.877-6.586c7.718-7.719 8.945-19.471 3.68-28.472-.487-.831-.396-1.897.285-2.577l.877-.878a2 2 0 000-2.828l-.707-.707z"
      ></path>
    </svg>
  )
}

export default InWorldContent
