import React, { forwardRef, useEffect } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import {
  GrantRequestCategoryAssessment,
  SponsorshipQuestions,
  SponsorshipQuestionsSchema,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { useGrantCategoryEditor } from '../../../hooks/useGrantCategoryEditor'
import { ContentSection } from '../../Layout/ContentLayout'
import Label from '../Label'
import MultipleChoiceField from '../MultipleChoiceField'

const INITIAL_SPONSORSHIP_QUESTIONS = {
  eventType: '',
  eventCategory: null,
  primarySourceFunding: '',
  totalEvents: '',
  totalAttendance: '',
  audienceRelevance: '',
  showcase: '',
}

const EVENT_CATEGORY_OPTIONS = ['conference', 'side_event', 'community_meetups', 'hackathon', 'other']

const schema = SponsorshipQuestionsSchema
const validate = createValidator<SponsorshipQuestions>({
  eventType: (state) => ({
    eventType:
      assert(state.eventType.length <= schema.eventType.maxLength, 'error.grant.category_assessment.field_too_large') ||
      assert(state.eventType.length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(state.eventType.length >= schema.eventType.minLength, 'error.grant.category_assessment.field_too_short') ||
      undefined,
  }),
  eventCategory: (state) => ({
    eventCategory:
      assert(state.eventCategory !== null, 'error.grant.category_assessment.field_invalid') ||
      assert(
        String(state.eventCategory).length <= schema.eventCategory.maxLength,
        'error.grant.category_assessment.field_too_large'
      ) ||
      assert(String(state.eventCategory).length > 0, 'error.grant.category_assessment.field_empty') ||
      assert(
        String(state.eventCategory).length >= schema.eventCategory.minLength,
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
  totalAttendance: (state) => ({
    totalAttendance:
      assert(Number.isInteger(asNumber(state.totalAttendance)), 'error.grant.category_assessment.field_invalid') ||
      assert(
        asNumber(state.totalAttendance) >= schema.totalAttendance.minimum,
        'error.grant.category_assessment.field_too_low'
      ) ||
      undefined,
  }),
  totalEvents: (state) => ({
    totalEvents:
      assert(Number.isInteger(asNumber(state.totalEvents)), 'error.grant.category_assessment.field_invalid') ||
      assert(
        asNumber(state.totalEvents) >= schema.totalEvents.minimum,
        'error.grant.category_assessment.field_too_low'
      ) ||
      undefined,
  }),
})

const edit = (state: SponsorshipQuestions, props: Partial<SponsorshipQuestions>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean) => void
  isFormDisabled: boolean
}

const SponsorshipSection = forwardRef(function SponsorshipSection({ onValidation, isFormDisabled }: Props, ref) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_SPONSORSHIP_QUESTIONS)

  useGrantCategoryEditor(ref, editor, state, INITIAL_SPONSORSHIP_QUESTIONS)

  useEffect(() => {
    onValidation({ sponsorship: { ...state.value } }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <div className="GrantRequestSection__Content">
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.event_type.label')}</Label>
        <SelectField
          value={state.value.eventType || undefined}
          onChange={(_, { value }) => editor.set({ eventType: String(value) })}
          options={[
            {
              text: t('page.submit_grant.category_assessment.sponsorship.event_type.choices.online'),
              value: t('page.submit_grant.category_assessment.sponsorship.event_type.choices.online'),
            },
            {
              text: t('page.submit_grant.category_assessment.sponsorship.event_type.choices.offline'),
              value: t('page.submit_grant.category_assessment.sponsorship.event_type.choices.offline'),
            },
          ]}
          error={!!state.error.eventType}
          message={t(state.error.eventType)}
          disabled={isFormDisabled}
        />
      </ContentSection>
      <MultipleChoiceField
        label={t('page.submit_grant.category_assessment.sponsorship.event_category.label')}
        intlKey="page.submit_grant.category_assessment.sponsorship.event_category.choices"
        options={EVENT_CATEGORY_OPTIONS}
        isFormDisabled={isFormDisabled}
        value={state.value.eventCategory}
        onChange={(value) => editor.set({ eventCategory: value })}
      />
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.primary_source_funding_label')}</Label>
        <SelectField
          value={state.value.primarySourceFunding || undefined}
          onChange={(_, { value }) => editor.set({ primarySourceFunding: String(value) })}
          options={[
            {
              text: 'Yes',
              value: 'Yes',
            },
            {
              text: 'No',
              value: 'No',
            },
          ]}
          error={!!state.error.primarySourceFunding}
          message={t(state.error.primarySourceFunding)}
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.total_events_label')}</Label>
        <Field
          type="number"
          value={state.value.totalEvents}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ totalEvents: value })}
          error={!!state.error.totalEvents}
          message={t(state.error.totalEvents)}
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.total_attendance_label')}</Label>
        <Field
          type="number"
          value={state.value.totalAttendance}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ totalAttendance: value })}
          error={!!state.error.totalAttendance}
          message={t(state.error.totalAttendance)}
          disabled={isFormDisabled}
        />
      </ContentSection>
      <ContentSection className="GrantRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.audience_relevance_label')}</Label>
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
        <Label>{t('page.submit_grant.category_assessment.sponsorship.showcase_label')}</Label>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.showcase}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ showcase: value })}
          error={!!state.error.showcase}
          message={
            t(state.error.showcase) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.showcase.length,
              limit: schema.showcase.maxLength,
            })
          }
          disabled={isFormDisabled}
        />
      </ContentSection>
    </div>
  )
})

export default SponsorshipSection
