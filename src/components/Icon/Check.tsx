function Check({ size = 20, color = 'var(--green-800)' }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 20 20">
      <path
        fill={color}
        d="M3.523 10.597a.628.628 0 01-.19-.418c0-.12.063-.298.19-.418l.883-.836a.634.634 0 01.884 0l2.509 2.612c.126.12.315.12.442 0l6.47-6.358a.634.634 0 01.883 0l.883.836a.556.556 0 010 .836L8.43 14.82a.589.589 0 01-.442.179.589.589 0 01-.442-.18l-4.023-4.223z"
      ></path>
    </svg>
  )
}

export default Check
