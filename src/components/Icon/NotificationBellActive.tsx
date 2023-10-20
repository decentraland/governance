function NotificationBellActive({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 36 36"
      className={className}
    >
      <rect width="36" height="36" fill="#fff" rx="18"></rect>
      <rect width="35" height="35" x="0.5" y="0.5" stroke="#736E7D" strokeOpacity="0.24" rx="17.5"></rect>
      <g clipPath="url(#clip0_7829_1973)">
        <path
          fill="#736E7D"
          d="M18 10c-.554 0-1 .447-1 1v.6a5.002 5.002 0 00-4 4.9v.587c0 1.47-.541 2.888-1.516 3.988l-.232.26A.998.998 0 0012 23h12a1.002 1.002 0 00.747-1.667l-.231-.259a6.008 6.008 0 01-1.516-3.988V16.5a5.002 5.002 0 00-4-4.9V11c0-.553-.447-1-1-1zm1.415 15.416A2 2 0 0019.999 24h-4a2 2 0 00.585 1.416 2 2 0 001.415.584 2 2 0 001.416-.584z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_7829_1973">
          <path fill="#fff" d="M0 0H14V16H0z" transform="translate(11 10)"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

export default NotificationBellActive
