import { useCallback } from 'react'

import { isEmpty } from 'lodash'

import useFormatMessage from '../../hooks/useFormatMessage'
import Label from '../Common/Typography/Label'
import Text from '../Common/Typography/Text'
import { ContentSection } from '../Layout/ContentLayout'

import CheckboxField from './CheckboxField'
import './MultipleChoiceField.css'

interface Props {
  label: string
  isFormDisabled: boolean
  value: string | null
  onChange: (newValue: string | null) => void
  intlKey: string
  options: string[]
  error: boolean
}

export default function MultipleChoiceField({
  label,
  isFormDisabled,
  value,
  onChange,
  options,
  intlKey,
  error,
}: Props) {
  const t = useFormatMessage()

  const handleEventCategoryChange = useCallback(
    (type: string) => {
      let values = value?.split(', ') || []
      const text = t(`${intlKey}.${type}`)

      if (values.includes(text)) {
        values = values.filter((item) => item !== text)
      } else {
        values.push(text)
      }

      const newValue = !isEmpty(values) ? values.join(', ') : null
      onChange(newValue)
    },
    [t, value, onChange, intlKey]
  )

  const isChecked = useCallback(
    (type: string) => {
      const values = value?.split(', ') || []
      const text = t(`${intlKey}.${type}`)

      return values.includes(text)
    },
    [t, value, intlKey]
  )

  return (
    <ContentSection className="ProjectRequestSection__Field">
      <Label>{label}</Label>
      {options.map((item) => (
        <CheckboxField
          key={item}
          disabled={isFormDisabled}
          checked={isChecked(item)}
          onClick={() => handleEventCategoryChange(item)}
        >
          {t(`${intlKey}.${item}`)}
        </CheckboxField>
      ))}
      {error && (
        <Text className="MultipleChoiceField__Error" weight="semi-bold" color="error">
          {t('error.grant.category_assessment.field_empty')}
        </Text>
      )}
    </ContentSection>
  )
}
