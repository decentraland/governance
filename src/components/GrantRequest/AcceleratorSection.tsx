import React, { useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestCategoryQuestions } from './GrantRequestCategorySection'
import Label from './Label'

export type AcceleratorQuestions = {
  revenueGenerationModel: string
  returnOfInvestmentPlan: string
  investmentRecoveryTime: string | number // TODO: Implement field
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

export default function AcceleratorSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_ACCELERATOR_QUESTIONS)

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
    </div>
  )
}
