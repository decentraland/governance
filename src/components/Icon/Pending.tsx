function Pending({ className, size = '32' }: { size?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C4.13403 15 1 11.866 1 8C1 4.13403 4.13403 1 8 1C11.866 1 15 4.13403 15 8C15 11.866 11.866 15 8 15ZM0 8C0 3.58167 3.58173 0 8 0C12.4183 0 16 3.58167 16 8C16 12.4183 12.4183 16 8 16C3.58173 16 0 12.4183 0 8ZM5 9C5.55231 9 6 8.55225 6 8C6 7.44775 5.55231 7 5 7C4.44769 7 4 7.44775 4 8C4 8.55225 4.44769 9 5 9ZM9 8C9 8.55225 8.55231 9 8 9C7.44769 9 7 8.55225 7 8C7 7.44775 7.44769 7 8 7C8.55231 7 9 7.44775 9 8ZM11 9C11.5523 9 12 8.55225 12 8C12 7.44775 11.5523 7 11 7C10.4477 7 10 7.44775 10 8C10 8.55225 10.4477 9 11 9Z"
        fill="#8F8B97"
      />
    </svg>
  )
}

export default Pending
