import React, { forwardRef, useCallback, useEffect } from 'react'

import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { isEmpty } from 'lodash'

import { asNumber } from '../../entities/Proposal/utils'
import { useGrantCategoryEditor } from '../../hooks/useGrantCategoryEditor'
import { ContentSection } from '../Layout/ContentLayout'

import CheckboxSection from './CheckboxSection'
import { GrantRequestCategoryQuestions } from './GrantRequestCategorySection'
import Label from './Label'

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
    minimum: 0,
  },
}

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
  onValidation: (data: Partial<GrantRequestCategoryQuestions>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const DocumentationSection = forwardRef(function DocumentationSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_DOCUMENTATION_QUESTIONS)

  const handleContentTypeChange = useCallback(
    (type: string) => {
      let contentTypeValues = state.value.contentType?.split(', ') || []
      const text = t(`page.submit_grant.category_assessment.documentation.content_type.choices.${type}`)

      if (contentTypeValues.includes(text)) {
        contentTypeValues = contentTypeValues.filter((item) => item !== text)
      } else {
        contentTypeValues.push(text)
      }

      const newContentType = !isEmpty(contentTypeValues) ? contentTypeValues.join(', ') : null
      editor.set({ contentType: newContentType })
    },
    [editor, t, state.value.contentType]
  )

  const isChecked = useCallback(
    (type: string) => {
      const contentTypeValues = state.value.contentType?.split(', ') || []
      const text = t(`page.submit_grant.category_assessment.documentation.content_type.choices.${type}`)

      return contentTypeValues.includes(text)
    },
    [t, state.value.contentType]
  )

  useGrantCategoryEditor(ref, editor, state, INITIAL_DOCUMENTATION_QUESTIONS)

  useEffect(() => {
    onValidation({ documentation: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.documentation.content_type.label')}</Label>
        <CheckboxSection
          disabled={isFormDisabled}
          checked={isChecked('documentation_article')}
          onClick={() => handleContentTypeChange('documentation_article')}
        >
          {t('page.submit_grant.category_assessment.documentation.content_type.choices.documentation_article')}
        </CheckboxSection>
        <CheckboxSection
          disabled={isFormDisabled}
          checked={isChecked('scene_example')}
          onClick={() => handleContentTypeChange('scene_example')}
        >
          {t('page.submit_grant.category_assessment.documentation.content_type.choices.scene_example')}
        </CheckboxSection>
        <CheckboxSection
          disabled={isFormDisabled}
          checked={isChecked('videos')}
          onClick={() => handleContentTypeChange('videos')}
        >
          {t('page.submit_grant.category_assessment.documentation.content_type.choices.videos')}
        </CheckboxSection>
        <CheckboxSection
          disabled={isFormDisabled}
          checked={isChecked('code_examples')}
          onClick={() => handleContentTypeChange('code_examples')}
        >
          {t('page.submit_grant.category_assessment.documentation.content_type.choices.code_examples')}
        </CheckboxSection>
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.documentation.total_pieces_label')}</Label>
        <Field
          type="number"
          min="0"
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
