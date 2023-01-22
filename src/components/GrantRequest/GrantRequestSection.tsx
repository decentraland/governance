import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
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
}

export default function GrantRequestSection({
  sectionTitle,
  sectionNumber,
  validated,
  isFormEdited,
  onBlur,
  children,
}: Props) {
  const t = useFormatMessage()
  const [focused, setFocused] = useState(false)

  return (
    <Container
      className="ContentLayout__Container GrantRequestSection__Container"
      onFocus={() => setFocused(true)}
      onBlur={() => {
        onBlur && onBlur()
        setFocused(false)
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
