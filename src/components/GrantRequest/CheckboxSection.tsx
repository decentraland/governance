import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'

import { Checkbox } from '../Checkbox/Checkbox'
import { ContentSection } from '../Layout/ContentLayout'

import './CheckboxSection.css'

interface Props {
  onClick: () => void
  checked: boolean
  disabled: boolean
  children: string
}

const CheckboxSection = ({ onClick, checked, disabled, children }: Props) => {
  return (
    <ContentSection className="CheckboxSection" onClick={onClick}>
      <Checkbox checked={checked} disabled={disabled} />
      <Markdown>{children}</Markdown>
    </ContentSection>
  )
}

export default CheckboxSection
