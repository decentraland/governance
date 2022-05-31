import React from 'react'

export default React.memo(function JumpIn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.1668 9.99998C19.1668 15.0626 15.0627 19.1666 10.0001 19.1666C5.36152 19.1666 1.52763 15.7213 0.917969 11.25H8.75012V13.5474C8.75012 14.1168 9.41795 14.4241 9.85045 14.0537L13.9925 10.5061C14.3031 10.2401 14.3032 9.75974 13.9927 9.49361L9.85065 5.94329C9.4182 5.57262 8.75012 5.87989 8.75012 6.44946V8.74998H0.917969C1.52763 4.27871 5.36152 0.833313 10.0001 0.833313C15.0627 0.833313 19.1668 4.93737 19.1668 9.99998Z"
      />
    </svg>
  )
})
