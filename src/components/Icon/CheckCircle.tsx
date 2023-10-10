function CheckCircle({ className, size = '32', outline }: { size?: string; className?: string; outline?: boolean }) {
  return (
    <>
      {outline ? (
        <svg
          width={size}
          height={size}
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="11" stroke="#44B600" strokeWidth="2" />
          <path d="M6 12L10 16L18 8" stroke="#44B600" strokeWidth="2" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          fill="none"
          viewBox="0 0 32 32"
          aria-hidden="true"
          className={className}
        >
          <circle cx="16" cy="16" r="16" fill="#44B600"></circle>
          <path
            fill="#fff"
            d="M14.95 20.947a1.697 1.697 0 01-2.437 0l-3.998-3.998a1.697 1.697 0 010-2.436 1.697 1.697 0 012.436 0l2.811 2.749 6.747-6.747a1.697 1.697 0 012.436 0 1.697 1.697 0 010 2.436l-7.996 7.996z"
          ></path>
        </svg>
      )}
    </>
  )
}

export default CheckCircle
