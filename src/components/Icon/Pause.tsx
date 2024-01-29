function Pause({ size = 10, color = 'var(--orange-800)' }: { size?: number; color?: string }) {
  return (
    <svg width={size * (5 / 8)} height={size} viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 7.49951V0.5" stroke={color} />
      <path d="M4 7.49951V0.5" stroke={color} />
    </svg>
  )
}

export default Pause
