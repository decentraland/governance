import React, { useCallback, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import {
  AcceleratorQuestions,
  AcceleratorQuestionsSchema,
  GrantRequestCategoryAssessment,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { disableOnWheelInput } from '../../../helpers'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Label'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, isDirty, values])

  const getMarkdownFieldRules = useCallback(
    (field: 'revenueGenerationModel' | 'returnOfInvestmentPlan') => ({
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
        <Label>{t('page.submit_grant.category_assessment.accelerator.revenue_label')}</Label>
        <MarkdownField
          name="revenueGenerationModel"
          control={control}
          error={!!errors.revenueGenerationModel}
          message={
            (errors.revenueGenerationModel?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('revenueGenerationModel').length,
              limit: schema.revenueGenerationModel.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={getMarkdownFieldRules('revenueGenerationModel')}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.return_of_investment_label')}</Label>
        <MarkdownField
          name="returnOfInvestmentPlan"
          control={control}
          error={!!errors.returnOfInvestmentPlan}
          message={
            (errors.returnOfInvestmentPlan?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('returnOfInvestmentPlan').length,
              limit: schema.returnOfInvestmentPlan.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={getMarkdownFieldRules('returnOfInvestmentPlan')}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.investment_recovery_label')}</Label>
        <Field
          name="investmentRecoveryTime"
          control={control}
          type="number"
          min="0"
          error={!!errors.investmentRecoveryTime}
          message={errors.investmentRecoveryTime?.message}
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
              value: schema.investmentRecoveryTime.minimum,
              message: t('error.grant.category_assessment.field_too_low'),
            },
          }}
        />
      </ContentSection>
    </div>
  )
}
