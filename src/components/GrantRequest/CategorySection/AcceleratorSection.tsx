import React, { forwardRef, useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import {
  AcceleratorQuestions,
  AcceleratorQuestionsSchema,
  GrantRequestCategoryAssessment,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { disableOnWheelInput } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useGrantCategoryEditor } from '../../../hooks/useGrantCategoryEditor'
import Label from '../../Common/Label'
import { ContentSection } from '../../Layout/ContentLayout'

const INITIAL_ACCELERATOR_QUESTIONS: AcceleratorQuestions = {
  revenueGenerationModel: '',
  returnOfInvestmentPlan: '',
  investmentRecoveryTime: '',
}

const schema = AcceleratorQuestionsSchema
const validate = createValidator<AcceleratorQuestions>({
  revenueGenerationModel: (state) => ({
    revenueGenerationModel:
      assert(
        state.revenueGenerationModel.length <= schema.revenueGenerationModel.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.revenueGenerationModel.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.revenueGenerationModel.length >= schema.revenueGenerationModel.minLength,
        'error.grant.category_assessment.field_too_short'
      ) ||
      undefined,
  }),
  returnOfInvestmentPlan: (state) => ({
    returnOfInvestmentPlan:
      assert(
        state.returnOfInvestmentPlan.length <= schema.returnOfInvestmentPlan.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.returnOfInvestmentPlan.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.returnOfInvestmentPlan.length >= schema.returnOfInvestmentPlan.minLength,
        'error.grant.category_assessment.field_too_short'
      ) ||
      undefined,
  }),
  investmentRecoveryTime: (state) => ({
    investmentRecoveryTime:
      assert(
        Number.isInteger(asNumber(state.investmentRecoveryTime)),
        'error.grant.category_assessment.field_invalid'
      ) ||
      assert(
        asNumber(state.investmentRecoveryTime) >= schema.investmentRecoveryTime.minimum,
        'error.grant.category_assessment.field_too_low'
      ) ||
      undefined,
  }),
})

const edit = (state: AcceleratorQuestions, props: Partial<AcceleratorQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const AcceleratorSection = forwardRef(function AcceleratorSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_ACCELERATOR_QUESTIONS)

  useGrantCategoryEditor(ref, editor, state, INITIAL_ACCELERATOR_QUESTIONS)

  useEffect(() => {
    onValidation({ accelerator: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.revenue_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.revenueGenerationModel}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ revenueGenerationModel: value })}
          error={!!state.error.revenueGenerationModel}
          message={
            t(state.error.revenueGenerationModel) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.revenueGenerationModel.length,
              limit: schema.revenueGenerationModel.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.return_of_investment_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.returnOfInvestmentPlan}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ returnOfInvestmentPlan: value })}
          error={!!state.error.returnOfInvestmentPlan}
          message={
            t(state.error.returnOfInvestmentPlan) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.returnOfInvestmentPlan.length,
              limit: schema.returnOfInvestmentPlan.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.accelerator.investment_recovery_label')}</Label>
        <Field
          type="number"
          min="0"
          value={state.value.investmentRecoveryTime}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ investmentRecoveryTime: value })}
          error={!!state.error.investmentRecoveryTime}
          message={t(state.error.investmentRecoveryTime)}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
        />
      </ContentSection>
    </div>
  )
})

export default AcceleratorSection
