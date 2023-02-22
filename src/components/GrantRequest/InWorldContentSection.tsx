import React, { forwardRef, useEffect, useImperativeHandle } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { asNumber } from '../../entities/Proposal/utils'
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
  totalPieces: {
    type: 'integer',
    minimum: 0,
  },
  totalUsers: {
    type: 'integer',
    minimum: 0,
  },
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
  totalPieces: (state) => ({
    totalPieces:
      assert(Number.isInteger(asNumber(state.totalPieces)), 'error.grant.category_assessment.field_invalid') ||
      assert(
        asNumber(state.totalPieces) >= schema.totalPieces.minimum,
        'error.grant.category_assessment.field_too_low'
      ) ||
      undefined,
  }),
  totalUsers: (state) => ({
    totalUsers:
      assert(Number.isInteger(asNumber(state.totalUsers)), 'error.grant.category_assessment.field_invalid') ||
      assert(
        asNumber(state.totalUsers) >= schema.totalUsers.minimum,
        'error.grant.category_assessment.field_too_low'
      ) ||
      undefined,
  }),
})

const edit = (state: InWorldContentQuestions, props: Partial<InWorldContentQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryQuestions>, sectionValid: boolean, onValidate: () => void) => void
  isFormDisabled: boolean
}

const InWorldContentSection = forwardRef(function InWorldContentSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_IN_WORLD_CONTENT_QUESTIONS)

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
    onValidation({ inWorldContent: { ...state.value } }, state.validated, editor.validate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.in_world_content.total_pieces_label')}</Label>
        <Field
          min="0"
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
          min="0"
          type="number"
          value={state.value.totalUsers}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ totalUsers: value })}
          error={!!state.error.totalUsers}
          message={t(state.error.totalUsers)}
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
})

export default InWorldContentSection
