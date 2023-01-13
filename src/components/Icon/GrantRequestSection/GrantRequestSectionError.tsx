import React from 'react'

import { GrantRequestSectionIconProps, getNumberIcon } from './GrantRequestSectionFocused'

function GrantRequestSectionError({ sectionNumber }: GrantRequestSectionIconProps) {
  const icon = getNumberIcon(sectionNumber)

  return (
    <svg
      width="34"
      height="42"
      viewBox="0 0 34 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="GrantRequestSection__FixedSizeIcon"
    >
      <circle cx="16" cy="21" r="15.5" stroke="#736E7D" strokeOpacity="0.32" />
      {icon}
      <circle cx="27" cy="32" r="6" fill="#D80027" stroke="white" strokeWidth="2" />
    </svg>
  )
}

export default GrantRequestSectionError
