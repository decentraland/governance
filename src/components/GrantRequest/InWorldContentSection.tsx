import React, { useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestCategoryQuestions } from './GrantRequestCategorySection'
import Label from './Label'

export type InWorldContentQuestions = {
  totalPieces: string | number
  totalUsers: string | number
  engagementMeasurement: string
}

const INITIAL_IN_WORLD_CONTENT_QUESTIONS = {
  totalPieces: '',
  totalUsers: '',
  engagementMeasurement: '',
}

const InWorldContentQuestionsSchema = {
  engagementMeasurement: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}

const schema = InWorldContentQuestionsSchema
const validate = createValidator<InWorldContentQuestions>({
  engagementMeasurement: (state) => ({
    engagementMeasurement:
      assert(
        state.engagementMeasurement.length <= schema.engagementMeasurement.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.engagementMeasurement.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.engagementMeasurement.length >= schema.engagementMeasurement.minLength,
        'error.grant.category_assessment.field_too_short'
      ) ||
      undefined,
  }),
  // TODO: Add totalPieces and totalUsers validation
})

const edit = (state: InWorldContentQuestions, props: Partial<InWorldContentQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryQuestions>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

export default function InWorldContentSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_IN_WORLD_CONTENT_QUESTIONS)

  useEffect(() => {
    onValidation({ inWorldContent: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.in_world_content.total_pieces_label')}</Label>
        <Field
          type="number"
          value={state.value.totalPieces}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ totalPieces: value })}
          error={!!state.error.totalPieces}
          message={t(state.error.totalPieces)}
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.in_world_content.total_users_label')}</Label>
        <Field
          type="number"
          value={state.value.engagementMeasurement}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ totalUsers: value })}
          error={!!state.error.engagementMeasurement}
          message={t(state.error.totalPieces)}
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.in_world_content.engagement_measurement_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.engagementMeasurement}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ engagementMeasurement: value })}
          error={!!state.error.engagementMeasurement}
          message={
            t(state.error.engagementMeasurement) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.engagementMeasurement.length,
              limit: schema.engagementMeasurement.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
    </div>
  )
}
