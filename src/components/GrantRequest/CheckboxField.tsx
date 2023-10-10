import { Checkbox } from '../Checkbox/Checkbox'
import Markdown from '../Common/Typography/Markdown'
import { ContentSection } from '../Layout/ContentLayout'

import './CheckboxField.css'

interface Props {
  onClick: () => void
  checked: boolean
  disabled: boolean
  children: string
}

const CheckboxField = ({ onClick, checked, disabled, children }: Props) => {
  return (
    <ContentSection className="CheckboxField" onClick={onClick}>
      <Checkbox checked={checked} disabled={disabled} />
      <Markdown size="lg" componentsClassNames={{ p: 'CheckboxField__Text' }}>
        {children}
      </Markdown>
    </ContentSection>
  )
}

export default CheckboxField
