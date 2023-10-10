import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function Documentation({ variant = CategoryIconVariant.Normal, size }: CategoryIconProps) {
  if (variant === CategoryIconVariant.Circled) {
    return (
      <svg width={size || 20} height={size || 20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#E0DCF3" />
        <rect x="5" y="5.16333" width="2.66826" height="10.673" rx="0.5" fill="#3C24B3" />
        <rect x="5" y="7.03113" width="2.66826" height="0.800477" fill="#E0DCF3" />
        <rect x="5" y="13.1682" width="2.66826" height="0.800477" fill="#E0DCF3" />
        <rect x="8.46875" y="5.16357" width="2.66826" height="10.673" rx="0.5" fill="#3C24B3" />
        <rect x="8.46875" y="7.03137" width="2.66826" height="0.800477" fill="#E0DCF3" />
        <rect x="8.46875" y="13.1682" width="2.66826" height="0.800477" fill="#E0DCF3" />
        <rect
          x="10.6016"
          y="5.69055"
          width="2.66826"
          height="10.673"
          rx="0.5"
          transform="rotate(-15 10.6016 5.69055)"
          fill="#3C24B3"
        />
        <rect
          x="11.0859"
          y="7.49463"
          width="2.66826"
          height="0.800477"
          transform="rotate(-15 11.0859 7.49463)"
          fill="#E0DCF3"
        />
        <rect
          x="12.6738"
          y="13.4225"
          width="2.66826"
          height="0.800477"
          transform="rotate(-15 12.6738 13.4225)"
          fill="#E0DCF3"
        />
      </svg>
    )
  }
  const primaryColor = getCategoryIconPrimaryColor('purple', variant)
  const secondaryColor = getCategoryIconSecondaryColor('purple', variant)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} fill="none" viewBox="-5 -5 52 52">
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
