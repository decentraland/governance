function QuestionCircle({ size = '17', className }: { size?: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 17 17"
      className={className}
    >
      <path
        fill="#D80027"
        fillRule="evenodd"
        d="M8.97 1.97a7 7 0 110 14 7 7 0 010-14zm0-1a8 8 0 110 16 8 8 0 010-16z"
        clipRule="evenodd"
        opacity="0.4"
      ></path>
      <path
        fill="#D80027"
        d="M6 6.748h1.415c.062-.875.67-1.429 1.613-1.429.937 0 1.545.547 1.545 1.3 0 .69-.294 1.08-1.12 1.578-.937.56-1.354 1.176-1.32 2.16l.007.52h1.415v-.41c0-.69.253-1.053 1.135-1.572.902-.54 1.435-1.286 1.435-2.338C12.125 5.073 10.908 4 9.104 4 7.12 4 6.062 5.176 6 6.748zm2.933 7.356c.629 0 1.052-.417 1.052-1.04 0-.635-.423-1.052-1.052-1.052-.63 0-1.06.417-1.06 1.053 0 .622.43 1.039 1.06 1.039z"
        opacity="0.4"
      ></path>
    </svg>
  )
}

export default QuestionCircle
