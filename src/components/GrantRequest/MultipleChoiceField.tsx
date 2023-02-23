import React, { useCallback } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { isEmpty } from 'lodash'

import { ContentSection } from '../Layout/ContentLayout'

import CheckboxField from './CheckboxField'
import Label from './Label'

interface Props {
  isFormDisabled: boolean
  value: string | null
  onChange: (newValue: string | null) => void
  intlKey: string
  options: string[]
}

const MultipleChoiceField = ({ isFormDisabled, value, onChange, options, intlKey }: Props) => {
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
      <Label>{t('page.submit_grant.category_assessment.sponsorship.event_category.label')}</Label>
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
