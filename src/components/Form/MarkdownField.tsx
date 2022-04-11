import React from 'react'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import { ContentSection } from '../Layout/ContentLayout'
import MarkdownNotice from './MarkdownNotice'
import { TextareaProps } from 'decentraland-gatsby/dist/components/Form/Textarea'

interface Props {
  label: string | null
  showMarkdownNotice?: boolean
}

const MarkdownField = ({ label, showMarkdownNotice = true, ...props }: Props & TextareaProps) => {
  return (
    <ContentSection>
      <Label>
        {label}
        {showMarkdownNotice && <MarkdownNotice />}
      </Label>
      <MarkdownTextarea minHeight={140} {...props} />
    </ContentSection>
  )
}

export default MarkdownField
