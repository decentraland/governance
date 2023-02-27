import React from 'react'

import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function SocialMediaContent({ variant = CategoryIconVariant.Normal, size = 42 }: CategoryIconProps) {
  const primaryColor = getCategoryIconPrimaryColor('yellow', variant)
  const secondaryColor = getCategoryIconSecondaryColor('yellow', variant)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="-5 -5 52 52">
      <path fill={primaryColor} d="M22.271 14.242a4.5 4.5 0 10-5 0V34.5a2.5 2.5 0 105 0V14.242z"></path>
      <path
        fill={secondaryColor}
        fillRule="evenodd"
        d="M6.139 4.799c.53-1.303.156-2.87-1.062-3.574-1.171-.676-2.684-.299-3.243.932-2.52 5.547-2.44 12.045.216 17.529.597 1.232 2.144 1.563 3.3.83 1.176-.744 1.495-2.301.939-3.577a15.723 15.723 0 01-.15-12.14zM11.924 8.056c.31-.61.09-1.343-.622-1.672-.685-.316-1.57-.14-1.897.436-1.473 2.595-1.426 5.633.127 8.198.349.576 1.254.731 1.93.388.688-.348.875-1.076.55-1.672-.98-1.796-1.011-3.864-.088-5.678zM34.016 17.035c-.53 1.303-.156 2.871 1.062 3.575 1.171.676 2.684.298 3.243-.933 2.52-5.547 2.439-12.044-.216-17.528-.597-1.233-2.144-1.564-3.301-.831-1.175.745-1.494 2.302-.938 3.577a15.723 15.723 0 01.15 12.14zM28.231 13.779c-.31.609-.091 1.342.621 1.671.685.316 1.57.14 1.897-.436 1.474-2.594 1.427-5.633-.126-8.197-.35-.577-1.254-.732-1.931-.389-.688.348-.874 1.076-.549 1.673.98 1.796 1.01 3.864.088 5.678z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default SocialMediaContent
