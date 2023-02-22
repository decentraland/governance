import React, { forwardRef, useEffect, useImperativeHandle } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { asNumber } from '../../entities/Proposal/utils'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestCategoryQuestions } from './GrantRequestCategorySection'
import Label from './Label'

export type AcceleratorQuestions = {
  revenueGenerationModel: string
  returnOfInvestmentPlan: string
  investmentRecoveryTime: string | number
}

const INITIAL_ACCELERATOR_QUESTIONS = {
  revenueGenerationModel: '',
  returnOfInvestmentPlan: '',
  investmentRecoveryTime: '',
}

const AcceleratorQuestionsSchema = {
  revenueGenerationModel: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  returnOfInvestmentPlan: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  investmentRecoveryTime: {
    type: 'integer',
    minimum: 0,
  },
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
  onValidation: (data: Partial<GrantRequestCategoryQuestions>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const AcceleratorSection = forwardRef(function AcceleratorSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_ACCELERATOR_QUESTIONS)

  useImperativeHandle(
    ref,
    () => {
      return {
        validate() {
          editor.validate()
        },
        isValidated() {
          return state.validated
        },
      }
    },
    [editor, state]
  )

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
        />
      </ContentSection>
    </div>
  )
})

export default AcceleratorSection
