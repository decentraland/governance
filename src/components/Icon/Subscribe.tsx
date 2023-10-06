interface Props {
  size?: string
  className?: string
}

function Subscribe({ size = '24', className }: Props) {
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
        stroke="#000"
        d="M17.252 19.5h0a.19.19 0 00.159-.083.56.56 0 00.089-.326V5.358c0-.439-.415-.858-.911-.858H7.36a.869.869 0 00-.861.858v13.733c0 .22.06.32.094.356a.155.155 0 00.121.053c.056 0 .157-.024.313-.157h0l4.114-3.526s0 0 0 0 0 0 0 0c.231-.198.534-.293.827-.293.292 0 .596.095.826.292v.001l4.128 3.525.001.001c.146.126.264.157.328.157z"
      ></path>
    </svg>
  )
}

export default Subscribe
