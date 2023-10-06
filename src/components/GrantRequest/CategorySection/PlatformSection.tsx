import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  GrantRequestCategoryAssessment,
  PlatformQuestions,
  PlatformQuestionsSchema,
} from '../../../entities/Grant/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
import { ContentSection } from '../../Layout/ContentLayout'

const INITIAL_PLATFORM_QUESTIONS = {
  impactMetrics: '',
}

const schema = PlatformQuestionsSchema

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean, isEdited: boolean) => void
  isFormDisabled: boolean
}

export default function PlatformSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    watch,
  } = useForm<PlatformQuestions>({
    defaultValues: INITIAL_PLATFORM_QUESTIONS,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ platform: { ...values } } as Partial<GrantRequestCategoryAssessment>, isValid, isDirty)
  }, [isValid, isDirty, onValidation, values])

  return (
    <div>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.platform.impact_metrics_label')}</Label>
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
          rules={{
            required: { value: true, message: t('error.grant.category_assessment.field_empty') },
            minLength: {
              value: schema.impactMetrics.minLength,
              message: t('error.grant.category_assessment.field_too_short'),
            },
            maxLength: {
              value: schema.impactMetrics.maxLength,
              message: t('error.grant.category_assessment.field_too_large'),
            },
          }}
        />
      </ContentSection>
    </div>
  )
}
