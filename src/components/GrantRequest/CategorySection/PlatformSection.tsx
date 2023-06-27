import React, { forwardRef, useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'

import {
  GrantRequestCategoryAssessment,
  PlatformQuestions,
  PlatformQuestionsSchema,
} from '../../../entities/Grant/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useGrantCategoryEditor } from '../../../hooks/useGrantCategoryEditor'
import Label from '../../Common/Typography/Label'
import { ContentSection } from '../../Layout/ContentLayout'

const INITIAL_PLATFORM_QUESTIONS = {
  impactMetrics: '',
}

const schema = PlatformQuestionsSchema
const validate = createValidator<PlatformQuestions>({
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

const edit = (state: PlatformQuestions, props: Partial<PlatformQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const PlatformSection = forwardRef(function PlatformSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_PLATFORM_QUESTIONS)

  useGrantCategoryEditor(ref, editor, state, INITIAL_PLATFORM_QUESTIONS)

  useEffect(() => {
    onValidation({ platform: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.platform.impact_metrics_label')}</Label>
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

export default PlatformSection
