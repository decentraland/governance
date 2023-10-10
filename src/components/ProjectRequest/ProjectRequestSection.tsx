import { useState } from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'

import SectionIcon from '../GrantRequest/SectionIcon'

import './ProjectRequestSection.css'

export type Props = {
  sectionTitle: string
  sectionNumber: number
  validated: boolean
  isFormEdited: boolean
  onBlur?: () => void
  children: React.ReactNode
  shouldFocus?: boolean
}

export default function ProjectRequestSection({
  sectionTitle,
  sectionNumber,
  validated,
  isFormEdited,
  onBlur,
  children,
  shouldFocus = true,
}: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <Container
      className="ContentLayout__Container ProjectRequestSection__Container"
      onFocus={() => shouldFocus && setFocused(true)}
      onBlur={() => {
        onBlur && onBlur()
        shouldFocus && setFocused(false)
      }}
    >
      <div className="ProjectRequestSection__Head">
        <div className="ProjectRequestSection__Header">
          <SectionIcon
            focused={focused}
            isFormEdited={isFormEdited}
            sectionNumber={sectionNumber}
            validated={validated}
          />
          <div className="ProjectRequestSection__HeaderTitle">{sectionTitle}</div>
          <div className="ProjectRequestSection__HorizontalLine" />
        </div>
        <div className="ProjectRequestSection__Content">{children}</div>
      </div>
    </Container>
  )
}
