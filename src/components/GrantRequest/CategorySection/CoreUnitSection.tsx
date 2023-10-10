import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  CoreUnitQuestions,
  CoreUnitQuestionsSchema,
  GrantRequestCategoryAssessment,
} from '../../../entities/Grant/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
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
  }, [isValid, isDirty, onValidation, values])

  const getMarkdownFieldProps = (field: 'strategicValue' | 'impactMetrics') => {
    return {
      name: field,
      control,
      error: !!errors[field],
      message:
        (errors[field]?.message || '') +
        ' ' +
        t('page.submit.character_counter', {
          current: watch(field).length,
          limit: schema[field].maxLength,
        }),
      disabled: isFormDisabled,
      rules: {
        required: { value: true, message: t('error.grant.category_assessment.field_empty') },
        minLength: {
          value: schema[field].minLength,
          message: t('error.grant.category_assessment.field_too_short'),
        },
        maxLength: {
          value: schema[field].maxLength,
          message: t('error.grant.category_assessment.field_too_large'),
        },
      },
    }
  }

  return (
    <div>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.core_unit.strategic_value_label')}</Label>
        <MarkdownField {...getMarkdownFieldProps('strategicValue')} />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.core_unit.impact_metrics_label')}</Label>
        <MarkdownField {...getMarkdownFieldProps('impactMetrics')} />
      </ContentSection>
    </div>
  )
}
