import classNames from 'classnames'

import { Checkbox } from '../Checkbox/Checkbox'
import Markdown from '../Common/Typography/Markdown'
import { ContentSection } from '../Layout/ContentLayout'

import './CheckboxField.css'

interface Props {
  onClick: () => void
  checked: boolean
  disabled: boolean
  children: string
  checkboxClass?: string
  checkboxLabelClass?: string
  checkboxLabelCheckedClass?: string
}

const CheckboxField = ({
  onClick,
  checked,
  disabled,
  children,
  checkboxClass,
  checkboxLabelClass,
  checkboxLabelCheckedClass,
}: Props) => {
  return (
    <ContentSection className="CheckboxField" onClick={onClick}>
      <Checkbox checked={checked} disabled={disabled} className={checkboxClass} />
      <Markdown
        size="lg"
        componentsClassNames={{
          p: classNames('CheckboxField__Text', checkboxLabelClass, checked && checkboxLabelCheckedClass),
        }}
      >
        {children}
      </Markdown>
    </ContentSection>
  )
}

export default CheckboxField
