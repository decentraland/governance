interface Props {
  size?: number
}

function Draft({ size = 48 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#FFE0D2"></circle>
      <g clipPath="url(#clip0_1931_9490)">
        <path
          fill="#FF7439"
          d="M13.8 15c-.993 0-1.8.807-1.8 1.8v2.4a.6.6 0 00.6.6h3v-3c0-.993-.807-1.8-1.8-1.8zm7.8 15.471V28.2h10.8v-9.6c0-1.985-1.615-3.6-3.6-3.6H16.185a2.97 2.97 0 01.615 1.8v13.8c0 1.458 1.3 2.612 2.803 2.367 1.18-.192 1.997-1.3 1.997-2.496zm1.2-1.071v1.2c0 1.985-1.615 3.6-3.6 3.6h12.6A4.2 4.2 0 0036 30a.6.6 0 00-.6-.6H22.8z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_1931_9490">
          <path fill="#fff" d="M0 0H24V19.2H0z" transform="translate(12 15)"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

export default Draft
