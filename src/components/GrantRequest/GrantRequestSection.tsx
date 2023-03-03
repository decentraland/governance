import React, { useState } from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'

import './GrantRequestSection.css'
import SectionIcon from './SectionIcon'

export type Props = {
  sectionTitle: string
  sectionNumber: number
  validated: boolean
  isFormEdited: boolean
  onBlur?: () => void
  children: React.ReactNode
  shouldFocus?: boolean
}

export default function GrantRequestSection({
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
      className="ContentLayout__Container GrantRequestSection__Container"
      onFocus={() => shouldFocus && setFocused(true)}
      onBlur={() => {
        onBlur && onBlur()
        shouldFocus && setFocused(false)
      }}
    >
      <div className="GrantRequestSection__Head">
        <div className="GrantRequestSection__Header">
          <SectionIcon
            focused={focused}
            isFormEdited={isFormEdited}
            sectionNumber={sectionNumber}
            validated={validated}
          />
          <div className="GrantRequestSection__HeaderTitle">{sectionTitle}</div>
          <div className="GrantRequestSection__HorizontalLine" />
        </div>
        {children}
      </div>
    </Container>
  )
}
