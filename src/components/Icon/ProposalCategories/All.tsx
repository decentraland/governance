interface Props {
  size?: number
}

function All({ size = 24 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#736E7D" opacity="0.16"></circle>
      <path
        fill="#736E7D"
        fillRule="evenodd"
        d="M7 7.5h10v1H7v-1zm0 2h10v1H7v-1zm10 2H7v1h10v-1zm-10 2h10v1H7v-1zm10 2H7v1h10v-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default All
