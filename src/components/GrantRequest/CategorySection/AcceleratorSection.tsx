import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  AcceleratorQuestions,
  AcceleratorQuestionsSchema,
  GrantRequestCategoryAssessment,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { disableOnWheelInput } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
import { ContentSection } from '../../Layout/ContentLayout'

const INITIAL_ACCELERATOR_QUESTIONS: AcceleratorQuestions = {
  revenueGenerationModel: '',
  returnOfInvestmentPlan: '',
  investmentRecoveryTime: '',
}

const schema = AcceleratorQuestionsSchema

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean, isEdited: boolean) => void
  isFormDisabled: boolean
}

type FieldName = 'investmentRecoveryTime'
type MarkdownFieldName = 'revenueGenerationModel' | 'returnOfInvestmentPlan'

export default function AcceleratorSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    watch,
  } = useForm<AcceleratorQuestions>({
    defaultValues: INITIAL_ACCELERATOR_QUESTIONS,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ accelerator: { ...values } } as Partial<GrantRequestCategoryAssessment>, isValid, isDirty)
  }, [isValid, isDirty, onValidation, values])

  const getFieldProps = (field: FieldName | MarkdownFieldName) => ({
    name: field,
    control,
    error: !!errors[field],
    disabled: isFormDisabled,
  })

  const getMarkdownFieldProps = (field: MarkdownFieldName) => ({
    ...getFieldProps(field),
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
  })

  return (
    <div>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.revenue_label')}</Label>
        <MarkdownField {...getMarkdownFieldProps('revenueGenerationModel')} />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.return_of_investment_label')}</Label>
        <MarkdownField {...getMarkdownFieldProps('returnOfInvestmentPlan')} />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.investment_recovery_label')}</Label>
        <Field
          {...getFieldProps('investmentRecoveryTime')}
          type="number"
          min="0"
          message={errors.investmentRecoveryTime?.message}
          onWheel={disableOnWheelInput}
          rules={{
            required: { value: true, message: t('error.grant.category_assessment.field_invalid') },
            validate: (value: string) => {
              if (!Number.isInteger(asNumber(value))) {
                return t('error.grant.category_assessment.field_invalid')
              }
            },
            min: {
              value: schema.investmentRecoveryTime.minimum,
              message: t('error.grant.category_assessment.field_too_low'),
            },
          }}
        />
      </ContentSection>
    </div>
  )
}
