import React from 'react'

import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../helpers/styles'

function Platform({ variant = CategoryIconVariant.Normal, size = 42 }: CategoryIconProps) {
  const primaryColor = getCategoryIconPrimaryColor('fuchsia', variant)
  const secondaryColor = getCategoryIconSecondaryColor('fuchsia', variant)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 52 52">
      <path fill={secondaryColor} d="M16.271 18H21.271V31H16.271z"></path>
      <rect width="37" height="13" x="0.271" y="30" fill={primaryColor} rx="3"></rect>
      <path fill={secondaryColor} d="M5.271 29a2 2 0 012-2h2a2 2 0 012 2v1h-6v-1z"></path>
      <path
        fill={primaryColor}
        fillRule="evenodd"
        d="M18.771 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19zm-2.5-11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Platform
