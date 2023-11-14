type SortProps = {
  descending?: boolean
  selected?: boolean
  selectedColor?: string
}

function Sort({ descending = true, selected = true, selectedColor = 'black-400' }: SortProps) {
  const rotate = descending ? 0 : 180
  const color = selected ? selectedColor : 'black-100'

  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 5 3"
      fill="none"
      transform={`rotate(${rotate}) translate(0, ${descending ? -0.5 : 2.5})`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.5 2.5L0 0H5L2.5 2.5Z" fill={`var(--${color})`} />
    </svg>
  )
}

export default Sort
