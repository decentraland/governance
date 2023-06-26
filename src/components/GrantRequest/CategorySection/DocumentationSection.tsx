import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import {
  DocumentationQuestions,
  DocumentationQuestionsSchema,
  GrantRequestCategoryAssessment,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { disableOnWheelInput } from '../../../helpers'
import Field from '../../Common/Form/Field'
import Label from '../../Common/Label'
import { ContentSection } from '../../Layout/ContentLayout'
import MultipleChoiceField from '../MultipleChoiceField'

const INITIAL_DOCUMENTATION_QUESTIONS = {
  contentType: null,
  totalPieces: '',
}

const CONTENT_TYPE_OPTIONS = ['documentation_article', 'scene_example', 'videos', 'code_examples', 'other']

const schema = DocumentationQuestionsSchema

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean, isEdited: boolean) => void
  isFormDisabled: boolean
}

export default function DocumentationSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    setValue,
    setError,
    trigger,
    clearErrors,
  } = useForm<DocumentationQuestions>({
    defaultValues: INITIAL_DOCUMENTATION_QUESTIONS,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ documentation: { ...values } } as Partial<GrantRequestCategoryAssessment>, isValid, isDirty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, isDirty, values])

  return (
    <div className="GrantRequestSection__Content">
      <MultipleChoiceField
        label={t('page.submit_grant.category_assessment.documentation.content_type.label')}
        intlKey="page.submit_grant.category_assessment.documentation.content_type.choices"
        options={CONTENT_TYPE_OPTIONS}
        isFormDisabled={isFormDisabled}
        value={values.contentType || ''}
        error={!!errors?.contentType}
        onChange={(value) => {
          clearErrors('contentType')
          setValue('contentType', value)
          if (value === '') {
            setError('contentType', { message: t('error.grant.category_assessment.field_empty') })
          } else if (isDirty) {
            trigger()
          }
        }}
      />
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.documentation.total_pieces_label')}</Label>
        <Field
          name="totalPieces"
          control={control}
          type="number"
          min="1"
          error={!!errors.totalPieces}
          message={errors.totalPieces?.message}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
          rules={{
            required: { value: true, message: t('error.grant.category_assessment.field_invalid') },
            validate: (value: string) => {
              if (!Number.isInteger(asNumber(value))) {
                return t('error.grant.category_assessment.field_invalid')
              }
            },
            min: {
              value: schema.totalPieces.minimum,
              message: t('error.grant.category_assessment.field_too_low'),
            },
          }}
        />
      </ContentSection>
    </div>
  )
}
