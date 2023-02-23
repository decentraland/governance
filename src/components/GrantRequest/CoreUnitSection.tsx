import React, { forwardRef, useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { useGrantCategoryEditor } from '../../hooks/useGrantCategoryEditor'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestCategoryAssessment } from './GrantRequestCategorySection'
import Label from './Label'

export type CoreUnitQuestions = {
  strategicValue: string
  impactMetrics: string
}

const INITIAL_CORE_UNIT_QUESTIONS = {
  strategicValue: '',
  impactMetrics: '',
}

const CoreUnitQuestionsSchema = {
  strategicValue: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  impactMetrics: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}

const schema = CoreUnitQuestionsSchema
const validate = createValidator<CoreUnitQuestions>({
  strategicValue: (state) => ({
    strategicValue:
      assert(
        state.strategicValue.length <= schema.strategicValue.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.strategicValue.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.strategicValue.length >= schema.strategicValue.minLength,
        'error.grant.category_assessment.field_too_short'
      ) ||
      undefined,
  }),
  impactMetrics: (state) => ({
    impactMetrics:
      assert(
        state.impactMetrics.length <= schema.impactMetrics.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.impactMetrics.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.impactMetrics.length >= schema.impactMetrics.minLength,
        'error.grant.category_assessment.field_too_short'
      ) ||
      undefined,
  }),
})

const edit = (state: CoreUnitQuestions, props: Partial<CoreUnitQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const CoreUnitSection = forwardRef(function CoreUnitSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_CORE_UNIT_QUESTIONS)

  useGrantCategoryEditor(ref, editor, state, INITIAL_CORE_UNIT_QUESTIONS)

  useEffect(() => {
    onValidation({ coreUnit: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.core_unit.strategic_value_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.strategicValue}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ strategicValue: value })}
          error={!!state.error.strategicValue}
          message={
            t(state.error.strategicValue) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.strategicValue.length,
              limit: schema.strategicValue.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.core_unit.impact_metrics_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.impactMetrics}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ impactMetrics: value })}
          error={!!state.error.impactMetrics}
          message={
            t(state.error.impactMetrics) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.impactMetrics.length,
              limit: schema.impactMetrics.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
    </div>
  )
})

export default CoreUnitSection
