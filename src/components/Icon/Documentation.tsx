import React from 'react'

import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../helpers/styles'

function Documentation({ variant = CategoryIconVariant.Normal, size = 42 }: CategoryIconProps) {
  if (variant === CategoryIconVariant.Filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 52 52">
        <rect width="10" height="40" x="0.223" y="1" fill="var(--purple-800)" rx="2"></rect>
        <path fill="var(--white-900)" d="M0.223 8H10.223V11H0.223z"></path>
        <path fill="var(--white-900)" d="M0.223 31H10.223V34H0.223z"></path>
        <rect width="10" height="40" x="13.223" y="1" fill="var(--purple-800)" rx="2"></rect>
        <path fill="var(--white-900)" d="M13.223 8H23.223V11H13.223z"></path>
        <path fill="var(--white-900)" d="M13.223 31H23.223V34H13.223z"></path>
        <rect
          width="10"
          height="40"
          x="21.217"
          y="2.976"
          fill="var(--purple-800)"
          rx="2"
          transform="rotate(-15 21.217 2.976)"
        ></rect>
        <path
          fill="var(--white-900)"
          d="M23.028 9.737H33.028V12.737H23.028z"
          transform="rotate(-15 23.028 9.737)"
        ></path>
        <path
          fill="var(--white-900)"
          d="M28.981 31.953H38.981V34.953H28.981z"
          transform="rotate(-15 28.981 31.953)"
        ></path>
      </svg>
    )
  }
  const primaryColor = getCategoryIconPrimaryColor('purple', variant)
  const secondaryColor = getCategoryIconSecondaryColor('purple', variant)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 52 52">
      <rect width="10" height="40" x="0.223" y="1" fill={secondaryColor} rx="2"></rect>
      <path fill={primaryColor} d="M0.223 8H10.223V11H0.223z"></path>
      <path fill={primaryColor} d="M0.223 31H10.223V34H0.223z"></path>
      <rect width="10" height="40" x="13.223" y="1" fill={secondaryColor} rx="2"></rect>
      <path fill={primaryColor} d="M13.223 8H23.223V11H13.223z"></path>
      <path fill={primaryColor} d="M13.223 31H23.223V34H13.223z"></path>
      <rect
        width="10"
        height="40"
        x="21.217"
        y="2.976"
        fill={primaryColor}
        rx="2"
        transform="rotate(-15 21.217 2.976)"
      ></rect>
      <path fill={secondaryColor} d="M23.028 9.737H33.028V12.737H23.028z" transform="rotate(-15 23.028 9.737)"></path>
      <path fill={secondaryColor} d="M28.981 31.953H38.981V34.953H28.981z" transform="rotate(-15 28.981 31.953)"></path>
    </svg>
  )
}

export default Documentation
