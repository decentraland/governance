import { GrantRequestSectionIconProps } from './GrantRequestSectionFocused'
import NumberIcon from './NumberIcon'

function GrantRequestSectionUnfocused({ sectionNumber }: GrantRequestSectionIconProps) {
  return (
    <svg
      width="34"
      height="42"
      viewBox="0 0 34 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ProjectRequestSection__FixedSizeIcon"
    >
      <circle cx="16" cy="21" r="15.5" stroke="#736E7D" strokeOpacity="0.32" />
      <NumberIcon sectionNumber={sectionNumber} />
    </svg>
  )
}

export default GrantRequestSectionUnfocused
