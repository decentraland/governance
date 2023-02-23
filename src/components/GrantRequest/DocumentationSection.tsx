import React, { forwardRef, useEffect } from 'react'

import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { asNumber } from '../../entities/Proposal/utils'
import { useGrantCategoryEditor } from '../../hooks/useGrantCategoryEditor'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestCategoryAssessment } from './GrantRequestCategorySection'
import Label from './Label'
import MultipleChoiceField from './MultipleChoiceField'

export type DocumentationQuestions = {
  contentType: string | null
  totalPieces: string | number
}

const INITIAL_DOCUMENTATION_QUESTIONS = {
  contentType: null,
  totalPieces: '',
}

const DocumentationQuestionsSchema = {
  contentType: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  totalPieces: {
    type: 'integer',
    minimum: 1,
  },
}

const CONTENT_TYPE_OPTIONS = ['documentation_article', 'scene_example', 'videos', 'code_examples']

const schema = DocumentationQuestionsSchema
const validate = createValidator<DocumentationQuestions>({
  contentType: (state) => ({
    contentType:
      assert(state.contentType !== null, 'error.grant.category_assessment.field_invalid') ||
      assert(
        String(state.contentType).length <= schema.contentType.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(String(state.contentType).length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        String(state.contentType).length >= schema.contentType.minLength,
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
})

const edit = (state: DocumentationQuestions, props: Partial<DocumentationQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const DocumentationSection = forwardRef(function DocumentationSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_DOCUMENTATION_QUESTIONS)

  useGrantCategoryEditor(ref, editor, state, INITIAL_DOCUMENTATION_QUESTIONS)

  useEffect(() => {
    onValidation({ documentation: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <MultipleChoiceField
        intlKey="page.submit_grant.category_assessment.documentation.content_type.choices"
        options={CONTENT_TYPE_OPTIONS}
        isFormDisabled={isFormDisabled}
        value={state.value.contentType}
        onChange={(value) => editor.set({ contentType: value })}
      />
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.documentation.total_pieces_label')}</Label>
        <Field
          type="number"
          min="1"
          value={state.value.totalPieces}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ totalPieces: value })}
          error={!!state.error.totalPieces}
          message={t(state.error.totalPieces)}
          disabled={isFormDisabled}
        />
      </ContentSection>
    </div>
  )
})

export default DocumentationSection
