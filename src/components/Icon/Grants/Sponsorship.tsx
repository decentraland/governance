import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function Sponsorship({ variant = CategoryIconVariant.Normal, size }: CategoryIconProps) {
  if (variant === CategoryIconVariant.Circled) {
    return (
      <svg width={size || 20} height={size || 20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#FFE9DF" />
        <rect x="14.7422" y="5" width="1.29032" height="10" rx="0.645161" fill="#FF7439" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.09873 14.6772C10.2567 14.6772 11.1955 13.7384 11.1955 12.5804C11.1955 11.4224 10.2567 10.4836 9.09873 10.4836C7.94071 10.4836 7.00195 11.4224 7.00195 12.5804C7.00195 13.7384 7.94071 14.6772 9.09873 14.6772ZM9.09756 13.7095C9.72111 13.7095 10.2266 13.204 10.2266 12.5804C10.2266 11.9569 9.72111 11.4514 9.09756 11.4514C8.47401 11.4514 7.96853 11.9569 7.96853 12.5804C7.96853 13.204 8.47401 13.7095 9.09756 13.7095Z"
          fill="#FF7439"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.06571 11.4519C5.06549 11.808 4.77672 12.0966 4.42055 12.0966C4.06424 12.0966 3.77539 11.8078 3.77539 11.4515V8.54824C3.77539 8.19192 4.06424 7.90308 4.42055 7.90308C4.77676 7.90308 5.06555 8.19176 5.06571 8.54794L14.0967 5.96765V14.0322L5.06571 11.4519Z"
          fill="#FF7439"
        />
      </svg>
    )
  }

  const primaryColor = getCategoryIconPrimaryColor('orange', variant)
  const secondaryColor = getCategoryIconSecondaryColor('orange', variant)
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} fill="none" viewBox="-5 -10 52 52">
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
