function Megaphone({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="none"
      viewBox="0 0 80 80"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="#37333D"
        d="M75 28.063c2.906 1.375 5 5.078 5 9.437 0 4.36-2.094 8.063-5 9.438V70a5.019 5.019 0 01-3.094 4.625 4.986 4.986 0 01-5.437-1.094l-6.828-6.953C52.14 59.078 41.969 55 31.359 55H30v20c0 2.766-2.234 5-5 5H15c-2.76 0-5-2.234-5-5V55C4.477 55 0 50.516 0 45V30c0-5.515 4.477-10 10-10h21.36A40.008 40.008 0 0059.64 8.284l6.829-6.82A4.982 4.982 0 0171.906.382 4.997 4.997 0 0175 5v23.062zM31.36 30H30v15h1.36A49.979 49.979 0 0165 58.016V16.985A49.98 49.98 0 0131.36 30z"
      ></path>
    </svg>
  )
}

export default Megaphone
