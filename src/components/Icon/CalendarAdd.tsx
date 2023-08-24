import React from 'react'

interface Props {
  size?: string
  className?: string
}

function CalendarAdd({ size = '24', className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.75 0.75C5.75 0.334375 5.41563 0 5 0C4.58437 0 4.25 0.334375 4.25 0.75V2H3C1.89688 2 1 2.89687 1 4V4.5V6V14C1 15.1031 1.89688 16 3 16H13C14.1031 16 15 15.1031 15 14V6V4.5V4C15 2.89687 14.1031 2 13 2H11.75V0.75C11.75 0.334375 11.4156 0 11 0C10.5844 0 10.25 0.334375 10.25 0.75V2H5.75V0.75ZM2.5 6H13.5V14C13.5 14.275 13.275 14.5 13 14.5H3C2.725 14.5 2.5 14.275 2.5 14V6ZM8 7.25C7.58437 7.25 7.25 7.58437 7.25 8V9.5H5.75C5.33437 9.5 5 9.83438 5 10.25C5 10.6656 5.33437 11 5.75 11H7.25V12.5C7.25 12.9156 7.58437 13.25 8 13.25C8.41563 13.25 8.75 12.9156 8.75 12.5V11H10.25C10.6656 11 11 10.6656 11 10.25C11 9.83438 10.6656 9.5 10.25 9.5H8.75V8C8.75 7.58437 8.41563 7.25 8 7.25Z"
        fill="black"
      />
    </svg>
  )
}

export default CalendarAdd
