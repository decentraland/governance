interface Props {
  size?: string
  className?: string
}

function Subscribed({ size = '24', className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="#FF2D55"
        d="M7.361 4h9.228C17.34 4 18 4.622 18 5.358v13.733c0 .246-.068.452-.178.61a.689.689 0 01-.57.299c-.214 0-.443-.096-.654-.277l-4.128-3.527a.777.777 0 00-.501-.172.776.776 0 00-.501.172l-4.115 3.526c-.211.182-.424.278-.638.278-.362 0-.715-.281-.715-.909V5.358C6 4.622 6.61 4 7.361 4z"
      ></path>
    </svg>
  )
}

export default Subscribed
