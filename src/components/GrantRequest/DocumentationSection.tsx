import React, { useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestCategoryQuestions } from './GrantRequestCategorySection'
import Label from './Label'

export type DocumentationQuestions = {
  contentType: string // TODO: Implement multiple choice
  totalPieces: string | number // TODO: Implement number field
}

const INITIAL_DOCUMENTATION_QUESTIONS = {
  contentType: '',
  totalPieces: '',
}

const DocumentationQuestionsSchema = {
  contentType: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  totalPieces: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}

const schema = DocumentationQuestionsSchema
const validate = createValidator<DocumentationQuestions>({
  contentType: (state) => ({
    contentType:
      assert(
        state.contentType.length <= schema.contentType.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.contentType.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.contentType.length >= schema.contentType.minLength,
        'error.grant.category_assessment.field_too_short'
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
  onValidation: (data: Partial<GrantRequestCategoryQuestions>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

export default function DocumentationSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_DOCUMENTATION_QUESTIONS)

  useEffect(() => {
    onValidation({ documentation: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.documentation.content_type_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.contentType}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ contentType: value })}
          error={!!state.error.contentType}
          message={
            t(state.error.contentType) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.contentType.length,
              limit: schema.contentType.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.documentation.content_type.label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.contentType}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ contentType: value })}
          error={!!state.error.contentType}
          message={
            t(state.error.contentType) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.contentType.length,
              limit: schema.contentType.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
    </div>
  )
}
