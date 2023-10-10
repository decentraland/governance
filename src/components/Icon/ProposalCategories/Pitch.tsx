interface Props {
  size?: number
}

function Pitch({ size = 48 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#D80027" fillOpacity="0.16"></circle>
      <g clipPath="url(#clip0_10019_3595)">
        <path
          fill="#D80027"
          d="M32.75 15.25a1.255 1.255 0 00-2.137-.887L28.91 16.07A10 10 0 0121.84 19H16.5a2.502 2.502 0 00-2.5 2.5v3.75c0 1.379 1.121 2.5 2.5 2.5v5c0 .691.559 1.25 1.25 1.25h2.5c.691 0 1.25-.559 1.25-1.25v-5h.34a10 10 0 017.07 2.93l1.703 1.703c.36.36.895.465 1.364.27a1.25 1.25 0 00.773-1.157v-5.762c.727-.344 1.25-1.27 1.25-2.36 0-1.089-.523-2.015-1.25-2.358V15.25zm-2.5 2.996v10.258a12.495 12.495 0 00-8.41-3.254h-.34V21.5h.34c3.117 0 6.113-1.164 8.41-3.254z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_10019_3595">
          <path fill="#fff" d="M0 0H20V20H0z" transform="translate(14 14)"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

export default Pitch
