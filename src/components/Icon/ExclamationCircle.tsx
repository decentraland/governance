interface Props {
  className?: string
  size?: string
  color?: string
}

function ExclamationCircle({ className, size = '32', color }: Props) {
  const fill = color ? `var(--${color})` : `var(--black-600)`

  return (
    <svg
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1ZM8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0Z"
        fill={fill}
      />
      <rect x="9" y="-3" width="2" height="2" rx="1" transform="rotate(180 9 5)" fill={fill} />
      <rect x="9" y="16" width="2" height="7" rx="1" transform="rotate(180 9 13)" fill={fill} />
    </svg>
  )
}

export default ExclamationCircle
