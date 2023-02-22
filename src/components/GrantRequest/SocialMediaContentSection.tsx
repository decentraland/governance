import React, { forwardRef, useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { asNumber } from '../../entities/Proposal/utils'
import { useGrantCategoryEditor } from '../../hooks/useGrantCategoryEditor'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestCategoryQuestions } from './GrantRequestCategorySection'
import Label from './Label'

export type SocialMediaContentQuestions = {
  socialMediaPlatforms: string // TODO: Implement multiple choice
  audienceRelevance: string
  totalPieces: string | number
  totalPeopleImpact: string | number
  relevantLink: string
}

const INITIAL_SOCIAL_MEDIA_CONTENT_QUESTIONS = {
  socialMediaPlatforms: '',
  audienceRelevance: '',
  totalPieces: '',
  totalPeopleImpact: '',
  relevantLink: '',
}

const SocialMediaContentQuestionsSchema = {
  socialMediaPlatforms: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  audienceRelevance: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  totalPieces: {
    type: 'integer',
    minimum: 0,
  },
  totalPeopleImpact: {
    type: 'integer',
    minimum: 0,
  },
  relevantLink: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}

const schema = SocialMediaContentQuestionsSchema
const validate = createValidator<SocialMediaContentQuestions>({
  socialMediaPlatforms: (state) => ({
    socialMediaPlatforms:
      assert(
        state.socialMediaPlatforms.length <= schema.socialMediaPlatforms.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.socialMediaPlatforms.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.socialMediaPlatforms.length >= schema.socialMediaPlatforms.minLength,
        'error.grant.category_assessment.field_too_short'
      ) ||
      undefined,
  }),
  audienceRelevance: (state) => ({
    audienceRelevance:
      assert(
        state.audienceRelevance.length <= schema.audienceRelevance.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.audienceRelevance.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.audienceRelevance.length >= schema.audienceRelevance.minLength,
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
  totalPeopleImpact: (state) => ({
    totalPeopleImpact:
      assert(Number.isInteger(asNumber(state.totalPeopleImpact)), 'error.grant.category_assessment.field_invalid') ||
      assert(
        asNumber(state.totalPeopleImpact) >= schema.totalPeopleImpact.minimum,
        'error.grant.category_assessment.field_too_low'
      ) ||
      undefined,
  }),
  relevantLink: (state) => ({
    relevantLink:
      assert(
        state.relevantLink.length <= schema.relevantLink.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(state.relevantLink.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        state.relevantLink.length >= schema.relevantLink.minLength,
        'error.grant.category_assessment.field_too_short'
      ) ||
      undefined,
  }),
})

const edit = (state: SocialMediaContentQuestions, props: Partial<SocialMediaContentQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryQuestions>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const SocialMediaContentSection = forwardRef(function SocialMediaContentSection(
  { onValidation, isFormDisabled }: Props,
  ref
) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_SOCIAL_MEDIA_CONTENT_QUESTIONS)

  useGrantCategoryEditor(ref, editor, state, INITIAL_SOCIAL_MEDIA_CONTENT_QUESTIONS)

  useEffect(() => {
    onValidation({ socialMediaContent: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.social_media_platforms_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.socialMediaPlatforms}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ socialMediaPlatforms: value })}
          error={!!state.error.socialMediaPlatforms}
          message={
            t(state.error.socialMediaPlatforms) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.socialMediaPlatforms.length,
              limit: schema.socialMediaPlatforms.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.audience_relevance_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.audienceRelevance}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ audienceRelevance: value })}
          error={!!state.error.audienceRelevance}
          message={
            t(state.error.audienceRelevance) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.audienceRelevance.length,
              limit: schema.audienceRelevance.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.total_pieces_label')}</Label>
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
        <Label>{t('page.submit_grant.category_assessment.social_media_content.total_impact_label')}</Label>
        <Field
          type="number"
          value={state.value.totalPeopleImpact}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ totalPeopleImpact: value })}
          error={!!state.error.totalPeopleImpact}
          message={t(state.error.totalPeopleImpact)}
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.relevant_link_label')}</Label>
        <Field
          value={state.value.relevantLink}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ relevantLink: value })}
          error={!!state.error.relevantLink}
          message={t(state.error.totalPieces)}
          disabled={isFormDisabled}
        />
      </ContentSection>
    </div>
  )
})

export default SocialMediaContentSection
