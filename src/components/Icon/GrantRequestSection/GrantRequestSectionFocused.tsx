import NumberIcon from './NumberIcon'

export interface GrantRequestSectionIconProps {
  sectionNumber: number
}

function GrantRequestSectionFocused({ sectionNumber }: GrantRequestSectionIconProps) {
  return (
    <svg
      width="34"
      height="42"
      viewBox="0 0 34 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ProjectRequestSection__FixedSizeIcon"
    >
      <circle cx="16" cy="21" r="16" fill="#16141A" />
      <NumberIcon sectionNumber={sectionNumber} color={'var(--white-900)'} />
    </svg>
  )
}

export default GrantRequestSectionFocused
