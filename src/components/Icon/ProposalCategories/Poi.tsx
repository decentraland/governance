interface Props {
  size?: number
}

function Poi({ size = 48 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#44B600" opacity="0.16"></circle>
      <path
        fill="#44B600"
        fillRule="evenodd"
        d="M32 22.127c0 4.488-8 13.206-8 13.206s-8-8.718-8-13.206C16 17.639 19.582 14 24 14s8 3.639 8 8.127zm-5 0c0 1.683-1.343 3.048-3 3.048s-3-1.365-3-3.048 1.343-3.048 3-3.048 3 1.365 3 3.048z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Poi
