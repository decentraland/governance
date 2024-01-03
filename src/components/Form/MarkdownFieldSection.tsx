import { FieldValues } from 'react-hook-form'

import DAOMarkdownField, { MarkdownFieldProps } from '../Common/Form/MarkdownField'
import Label from '../Common/Typography/Label'
import ContentSection from '../Layout/ContentSection'

import MarkdownNotice from './MarkdownNotice'

interface Props {
  label: string | null
  showMarkdownNotice?: boolean
}

export default function MarkdownField<T extends FieldValues>({
  label,
  showMarkdownNotice = true,
  ...props
}: Props & MarkdownFieldProps<T>) {
  return (
    <ContentSection>
      <Label>
        {label}
        {showMarkdownNotice && <MarkdownNotice />}
      </Label>
      <DAOMarkdownField {...props} />
    </ContentSection>
  )
}
