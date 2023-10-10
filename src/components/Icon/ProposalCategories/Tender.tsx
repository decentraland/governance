interface Props {
  size?: number
}

function Tender({ size = 48 }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#D80027" fillOpacity="0.16"></circle>
      <path
        fill="#D80027"
        d="M18.08 22.868L15 28.212v-9.837c0-1.241.996-2.25 2.222-2.25h4.08c.59 0 1.156.235 1.573.657l.92.932a2.21 2.21 0 001.573.658h4.076c1.226 0 2.223 1.009 2.223 2.25v1.125H20c-.792 0-1.52.425-1.92 1.117v.004zm.958.566a1.11 1.11 0 01.962-.559h13.889c.4 0 .764.215.962.566.198.352.198.78-.004 1.129l-3.889 6.75a1.104 1.104 0 01-.958.555H16.111a1.1 1.1 0 01-.962-.566 1.138 1.138 0 01.004-1.129l3.889-6.75-.004.004z"
      ></path>
    </svg>
  )
}

export default Tender
