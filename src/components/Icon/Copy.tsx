function Copy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="32" fill="#FCE9EC" />
      <g clipPath="url(#clip0_10793_1886)">
        <path
          d="M39.5 37H32C30.6211 37 29.5 35.8789 29.5 34.5V24.5C29.5 23.1211 30.6211 22 32 22H37.4727C37.9688 22 38.4453 22.1992 38.7969 22.5508L41.4492 25.2031C41.8008 25.5547 42 26.0312 42 26.5273V34.5C42 35.8789 40.8789 37 39.5 37ZM24.5 27H28.25V28.875H24.5C24.1562 28.875 23.875 29.1562 23.875 29.5V39.5C23.875 39.8438 24.1562 40.125 24.5 40.125H32C32.3438 40.125 32.625 39.8438 32.625 39.5V38.25H34.5V39.5C34.5 40.8789 33.3789 42 32 42H24.5C23.1211 42 22 40.8789 22 39.5V29.5C22 28.1211 23.1211 27 24.5 27Z"
          fill="#FF2D55"
        />
      </g>
      <defs>
        <clipPath id="clip0_10793_1886">
          <rect width="20" height="20" fill="white" transform="translate(22 22)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default Copy
