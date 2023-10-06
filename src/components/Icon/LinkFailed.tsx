function LinkFailed() {
  return (
    <svg width="72" height="40" viewBox="0 0 72 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="19" r="4" fill="#D9D9D9" />
      <circle cx="20" cy="19" r="4" fill="#D9D9D9" />
      <circle cx="52" cy="19" r="4" fill="#D9D9D9" />
      <circle cx="68" cy="19" r="4" fill="#D9D9D9" />
      <g filter="url(#filter0_d_10852_1887)">
        <circle cx="36" cy="19" r="16" fill="#D80027" />
      </g>
      <path d="M31 24L41 14" stroke="white" strokeWidth="4" />
      <path d="M41 24L31 14" stroke="white" strokeWidth="4" />
      <defs>
        <filter
          id="filter0_d_10852_1887"
          x="16"
          y="0"
          width="40"
          height="40"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.847059 0 0 0 0 0 0 0 0 0 0.152941 0 0 0 0.4 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_10852_1887" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_10852_1887" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

export default LinkFailed
