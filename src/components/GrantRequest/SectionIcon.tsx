import GrantRequestSectionError from '../Icon/GrantRequestSection/GrantRequestSectionError'
import GrantRequestSectionFocused from '../Icon/GrantRequestSection/GrantRequestSectionFocused'
import GrantRequestSectionOk from '../Icon/GrantRequestSection/GrantRequestSectionOk'
import GrantRequestSectionUnfocused from '../Icon/GrantRequestSection/GrantRequestSectionUnfocused'

export type Props = {
  focused: boolean
  isFormEdited: boolean
  sectionNumber: number
  validated: boolean
}

export default function SectionIcon({ sectionNumber, validated, focused, isFormEdited }: Props) {
  return (
    <>
      {focused ? (
        <GrantRequestSectionFocused sectionNumber={sectionNumber} />
      ) : !isFormEdited ? (
        <GrantRequestSectionUnfocused sectionNumber={sectionNumber} />
      ) : validated ? (
        <GrantRequestSectionOk sectionNumber={sectionNumber} />
      ) : (
        <GrantRequestSectionError sectionNumber={sectionNumber} />
      )}
    </>
  )
}
