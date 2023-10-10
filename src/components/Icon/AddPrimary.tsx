interface Props {
  className?: string
}

function AddPrimary({ className }: Props) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="12" fill="var(--dcl-primary)" transform="rotate(-180 12 12)"></circle>
      <path
        fill="var(--white-900)"
        d="M7.067 12.473h3.915v3.748h1.809v-3.748h3.924v-1.81h-3.924V6.917h-1.81v3.748H7.068v1.809z"
      ></path>
    </svg>
  )
}

export default AddPrimary
