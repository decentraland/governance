import { useCallback, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  GrantRequestCategoryAssessment,
  InWorldContentQuestions,
  InWorldContentQuestionsSchema,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { disableOnWheelInput } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
import { ContentSection } from '../../Layout/ContentLayout'

const INITIAL_IN_WORLD_CONTENT_QUESTIONS = {
  totalPieces: '',
  totalUsers: '',
  engagementMeasurement: '',
}

const schema = InWorldContentQuestionsSchema

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean, isEdited: boolean) => void
  isFormDisabled: boolean
}

export default function InWorldContentSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    watch,
  } = useForm<InWorldContentQuestions>({
    defaultValues: INITIAL_IN_WORLD_CONTENT_QUESTIONS,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ inWorldContent: { ...values } } as Partial<GrantRequestCategoryAssessment>, isValid, isDirty)
  }, [isValid, isDirty, onValidation, values])

  const getFieldRules = useCallback(
    (field: 'totalPieces' | 'totalUsers') => ({
      required: { value: true, message: t('error.grant.category_assessment.field_invalid') },
      validate: (value: string) => {
        if (!Number.isInteger(asNumber(value))) {
          return t('error.grant.category_assessment.field_invalid')
        }
      },
      min: {
        value: schema[field].minimum,
        message: t('error.grant.category_assessment.field_too_low'),
      },
    }),
    [t]
  )

  return (
    <div>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.in_world_content.total_pieces_label')}</Label>
        <Field
          name="totalPieces"
          control={control}
          min="0"
          type="number"
          error={!!errors.totalPieces}
          message={errors.totalPieces?.message}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
          rules={getFieldRules('totalPieces')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.in_world_content.total_users_label')}</Label>
        <Field
          name="totalUsers"
          control={control}
          min="0"
          type="number"
          error={!!errors.totalUsers}
          message={errors.totalUsers?.message}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
          rules={getFieldRules('totalUsers')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.in_world_content.engagement_measurement_label')}</Label>
        <MarkdownField
          name="engagementMeasurement"
          control={control}
          error={!!errors.engagementMeasurement}
          message={
            (errors.engagementMeasurement?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('engagementMeasurement').length,
              limit: schema.engagementMeasurement.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={{
            required: { value: true, message: t('error.grant.category_assessment.field_empty') },
            minLength: {
              value: schema.engagementMeasurement.minLength,
              message: t('error.grant.category_assessment.field_too_short'),
            },
            maxLength: {
              value: schema.engagementMeasurement.maxLength,
              message: t('error.grant.category_assessment.field_too_large'),
            },
          }}
        />
      </ContentSection>
    </div>
  )
}
