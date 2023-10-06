import {
  CategoryIconProps,
  CategoryIconVariant,
  getCategoryIconPrimaryColor,
  getCategoryIconSecondaryColor,
} from '../../../helpers/styles'

function Accelerator({ variant = CategoryIconVariant.Normal, size }: CategoryIconProps) {
  if (variant === CategoryIconVariant.Circled) {
    return (
      <svg width={size || 20} height={size || 20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="10" fill="#E1F3D6" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.6759 13.3817H7.03512C7.49803 13.3817 7.87329 13.0065 7.87329 12.5435C7.87329 12.3452 7.71246 12.1843 7.51407 12.1843C7.05116 12.1843 6.6759 12.5596 6.6759 13.0225V13.3817ZM7.51407 10.9869C6.38987 10.9869 5.47852 11.8983 5.47852 13.0225V14.4765C5.47852 14.5331 5.52447 14.5791 5.58115 14.5791H7.03512C8.15933 14.5791 9.07068 13.6677 9.07068 12.5435C9.07068 11.6839 8.37376 10.9869 7.51407 10.9869Z"
          fill="#44B600"
        />
        <path
          d="M10.7721 7.53068C10.6794 7.44338 10.5568 7.39478 10.4294 7.39478H6.96353C6.78569 7.39478 6.62124 7.48923 6.53164 7.64284L5.43863 9.51657C5.24419 9.8499 5.48462 10.2685 5.87052 10.2685H9.28955C9.56569 10.2685 9.78955 10.4924 9.78955 10.7685V14.1875C9.78955 14.5734 10.2082 14.8139 10.5415 14.6194L12.4152 13.5264C12.5688 13.4368 12.6633 13.2724 12.6633 13.0945V9.52663C12.6633 9.38877 12.6064 9.25702 12.506 9.16253L10.7721 7.53068Z"
          fill="#44B600"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.78942 12.4238V12.6278C12.052 11.523 14.9998 9.98805 14.9998 7.35123V6.02322C14.9998 5.47895 14.579 5 14.0107 5H12.501C10.0191 5 8.55529 8.01444 7.50781 10.2685H7.63413C8.82446 10.2685 9.78942 11.2335 9.78942 12.4238ZM12.5434 7.87373C12.874 7.87373 13.1421 7.60568 13.1421 7.27504C13.1421 6.94439 12.874 6.67634 12.5434 6.67634C12.2127 6.67634 11.9447 6.94439 11.9447 7.27504C11.9447 7.60568 12.2127 7.87373 12.5434 7.87373Z"
          fill="#44B600"
        />
      </svg>
    )
  }

  const primaryColor = getCategoryIconPrimaryColor('green', variant)
  const secondaryColor = getCategoryIconSecondaryColor('green', variant)
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} fill="none" viewBox="-5 -5 52 52">
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
