import React, { useCallback } from 'react'

import { isEmpty } from 'lodash'

import useFormatMessage from '../../hooks/useFormatMessage'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'

import CheckboxField from './CheckboxField'

interface Props {
  label: string
  isFormDisabled: boolean
  value: string | null
  onChange: (newValue: string | null) => void
  intlKey: string
  options: string[]
}

const MultipleChoiceField = ({ label, isFormDisabled, value, onChange, options, intlKey }: Props) => {
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
    <ContentSection className="GrantRequestSection__Field">
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
    </ContentSection>
  )
}

export default MultipleChoiceField
