function CircledForum({ className, size = '64' }: { size?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="32" fill="#FCE9EC" />
      <path
        d="M32.5975 20.625C26.3033 20.625 21 25.627 21 31.802C21 32 21.0051 43.375 21.0051 43.375L32.5975 43.3648C38.8969 43.3648 44 38.1699 44 31.9949C44 25.8199 38.8969 20.625 32.5975 20.625ZM32.5 38.5C31.504 38.5 30.5542 38.2816 29.7071 37.8855L25.5435 38.9062L26.7192 35.0977C26.2161 34.1785 25.9286 33.1223 25.9286 32C25.9286 28.4098 28.8703 25.5 32.5 25.5C36.1297 25.5 39.0714 28.4098 39.0714 32C39.0714 35.5902 36.1297 38.5 32.5 38.5Z"
        fill="#FF2D55"
      />
    </svg>
  )
}

export default CircledForum
