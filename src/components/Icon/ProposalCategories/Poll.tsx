interface Props {
  size?: number
}

function Poll({ size = 48 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#FF7439" opacity="0.16"></circle>
      <path
        fill="#FF7439"
        fillRule="evenodd"
        d="M26 32h-4V15h4v17zm-6 0h-4V20h4v12zm8 0h4v-7h-4v7z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Poll
