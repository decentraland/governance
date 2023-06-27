import React, { useCallback, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  CoreUnitQuestions,
  CoreUnitQuestionsSchema,
  GrantRequestCategoryAssessment,
} from '../../../entities/Grant/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Label'
import { ContentSection } from '../../Layout/ContentLayout'

const INITIAL_CORE_UNIT_QUESTIONS = {
  strategicValue: '',
  impactMetrics: '',
}

const schema = CoreUnitQuestionsSchema

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean, isEdited: boolean) => void
  isFormDisabled: boolean
}

export default function CoreUnitSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    watch,
  } = useForm<CoreUnitQuestions>({
    defaultValues: INITIAL_CORE_UNIT_QUESTIONS,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ coreUnit: { ...values } } as Partial<GrantRequestCategoryAssessment>, isValid, isDirty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, isDirty, values])

  const getMarkdownFieldRules = useCallback(
    (field: 'strategicValue' | 'impactMetrics') => ({
      required: { value: true, message: t('error.grant.category_assessment.field_empty') },
      minLength: {
        value: schema[field].minLength,
        message: t('error.grant.category_assessment.field_too_short'),
      },
      maxLength: {
        value: schema[field].maxLength,
        message: t('error.grant.category_assessment.field_too_large'),
      },
    }),
    [t]
  )

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.core_unit.strategic_value_label')}</Label>
        <MarkdownField
          name="strategicValue"
          control={control}
          error={!!errors.strategicValue}
          message={
            (errors.strategicValue?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('strategicValue').length,
              limit: schema.strategicValue.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={getMarkdownFieldRules('strategicValue')}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.core_unit.impact_metrics_label')}</Label>
        <MarkdownField
          name="impactMetrics"
          control={control}
          error={!!errors.impactMetrics}
          message={
            (errors.impactMetrics?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('impactMetrics').length,
              limit: schema.impactMetrics.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={getMarkdownFieldRules('impactMetrics')}
        />
      </ContentSection>
    </div>
  )
}
