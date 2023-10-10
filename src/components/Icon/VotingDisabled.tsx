function VotingDisabled({
  className,
  width = '126',
  height = '98',
}: {
  width?: string
  height?: string
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 57H10C4.47715 57 0 61.4772 0 67V88C0 93.5228 4.47715 98 10 98H116C121.523 98 126 93.5228 126 88V67C126 61.4772 121.523 57 116 57H112V84H14V57Z"
        fill="#37333D"
      />
      <path d="M21 10C21 4.47715 25.4772 0 31 0H95C100.523 0 105 4.47715 105 10V77H21V10Z" fill="#B9B7BE" />
      <line x1="49" y1="53.2218" x2="76.2218" y2="26" stroke="white" strokeWidth="11" strokeLinecap="round" />
      <line x1="48.7782" y1="26" x2="76" y2="53.2218" stroke="white" strokeWidth="11" strokeLinecap="round" />
    </svg>
  )
}

export default VotingDisabled
