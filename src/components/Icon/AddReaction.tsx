function AddReaction({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="14" r="10" fill="#736E7D" />
      <circle cx="19" cy="7" r="7" fill="white" />
      <rect x="18" y="3" width="2" height="8" fill="#736E7D" />
      <rect x="23" y="6" width="2" height="8" transform="rotate(90 23 6)" fill="#736E7D" />
      <circle cx="6.5" cy="11.5" r="1.5" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.6586 16.0001H4.34141C5.16508 18.3305 7.38756 20.0001 10 20.0001C12.6124 20.0001 14.8349 18.3305 15.6586 16.0001ZM4.0001 13.9646C4.00003 13.9764 4 13.9883 4 14.0001C4 14.0119 4.00003 14.0238 4.0001 14.0356V13.9646Z"
        fill="white"
      />
    </svg>
  )
}

export default AddReaction
