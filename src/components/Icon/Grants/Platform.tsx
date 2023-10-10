import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function Platform({ variant = CategoryIconVariant.Normal, size }: CategoryIconProps) {
  if (variant === CategoryIconVariant.Circled) {
    return (
      <svg width={size || 20} height={size || 20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#FFE4FF" />
        <rect x="9.46484" y="9.02319" width="1.39535" height="3.62791" fill="#FF5AFE" />
        <rect x="5" y="12.3721" width="10.3256" height="3.62791" rx="1" fill="#FF5AFE" />
        <path
          d="M6.5 11.03C6.5 10.7539 6.72386 10.53 7 10.53H7.67442C7.95056 10.53 8.17442 10.7539 8.17442 11.03V12.37H6.5V11.03Z"
          fill="#FF5AFE"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.1629 9.30233C11.6271 9.30233 12.814 8.11536 12.814 6.65116C12.814 5.18697 11.6271 4 10.1629 4C8.69868 4 7.51172 5.18697 7.51172 6.65116C7.51172 8.11536 8.69868 9.30233 10.1629 9.30233ZM9.46439 6.23249C9.77264 6.23249 10.0225 5.9826 10.0225 5.67435C10.0225 5.3661 9.77264 5.11621 9.46439 5.11621C9.15614 5.11621 8.90625 5.3661 8.90625 5.67435C8.90625 5.9826 9.15614 6.23249 9.46439 6.23249Z"
          fill="#FF5AFE"
        />
      </svg>
    )
  }

  const primaryColor = getCategoryIconPrimaryColor('fuchsia', variant)
  const secondaryColor = getCategoryIconSecondaryColor('fuchsia', variant)
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} fill="none" viewBox="-5 -5 52 52">
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
