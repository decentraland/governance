import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import GrantRequestSectionError from '../Icon/GrantRequestSection/GrantRequestSectionError'
import GrantRequestSectionFocused from '../Icon/GrantRequestSection/GrantRequestSectionFocused'
import GrantRequestSectionOk from '../Icon/GrantRequestSection/GrantRequestSectionOk'
import GrantRequestSectionUnfocused from '../Icon/GrantRequestSection/GrantRequestSectionUnfocused'

import './GrantRequestSection.css'

export type Props = {
  sectionTitle: string
  sectionNumber: number
  validated: boolean
  formEdited: boolean
  onBlur: () => void
  children: React.ReactNode
}

function getSectionIcon(focused: boolean, formEdited: boolean, sectionNumber: number, validated: boolean) {
  if (focused) {
    return <GrantRequestSectionFocused sectionNumber={sectionNumber} />
  } else {
    if (!formEdited) {
      return <GrantRequestSectionUnfocused />
    } else {
      if (validated) {
        return <GrantRequestSectionOk />
      } else {
        return <GrantRequestSectionError />
      }
    }
  }
}

export default function GrantRequestSection({
  sectionTitle,
  sectionNumber,
  validated,
  formEdited,
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
        onBlur()
        setFocused(false)
      }}
    >
      <div className="GrantRequestSection__Head">
        <div className="GrantRequestSection__Header">
          {getSectionIcon(focused, formEdited, sectionNumber, validated)}
          <div className="GrantRequestSection__HeaderTitle">{sectionTitle}</div>
          <div className="GrantRequestSection__HorizontalLine" />
        </div>
        {children}
      </div>
    </Container>
  )
}
