import { useCallback, useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import {
  GrantRequestCategoryAssessment,
  SponsorshipQuestions,
  SponsorshipQuestionsSchema,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { disableOnWheelInput } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
import { ContentSection } from '../../Layout/ContentLayout'
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
const PRIMARY_SOURCE_FUNDING_OPTIONS = [
  {
    text: 'Yes',
    value: 'Yes',
  },
  {
    text: 'No',
    value: 'No',
  },
]

const schema = SponsorshipQuestionsSchema

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean, isEdited: boolean) => void
  isFormDisabled: boolean
}

export default function SponsorshipSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    setValue,
    setError,
    trigger,
    clearErrors,
    watch,
  } = useForm<SponsorshipQuestions>({
    defaultValues: INITIAL_SPONSORSHIP_QUESTIONS,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ sponsorship: { ...values } } as Partial<GrantRequestCategoryAssessment>, isValid, isDirty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, isDirty, values])

  const getNumberFieldRules = useCallback(
    (field: 'totalAttendance' | 'totalEvents') => ({
      required: { value: true, message: t('error.grant.category_assessment.field_invalid') },
      validate: (value: string) => {
        if (!Number.isInteger(asNumber(value))) {
          return t('error.grant.category_assessment.field_invalid')
        }
      },
      min: {
        value: schema[field].minimum,
        message: t('error.grant.category_assessment.field_too_low'),
      },
    }),
    [t]
  )

  const getMarkdownFieldRules = useCallback(
    (field: 'audienceRelevance' | 'showcase') => ({
      required: { value: true, message: t('error.grant.category_assessment.field_empty') },
      minLength: {
        value: schema[field].minLength,
        message: t('error.grant.category_assessment.field_too_short'),
      },
      maxLength: {
        value: schema[field].maxLength,
        message: t('error.grant.category_assessment.field_too_large'),
      },
    }),
    [t]
  )

  return (
    <div>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.event_type.label')}</Label>
        <Controller
          name="eventType"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectField
              {...field}
              onChange={(_, { value }) => setValue('eventType', value as string)}
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
              error={!!errors.eventType}
              message={errors.eventType?.message}
              disabled={isFormDisabled}
            />
          )}
        />
      </ContentSection>
      <MultipleChoiceField
        label={t('page.submit_grant.category_assessment.sponsorship.event_category.label')}
        intlKey="page.submit_grant.category_assessment.sponsorship.event_category.choices"
        options={EVENT_CATEGORY_OPTIONS}
        isFormDisabled={isFormDisabled}
        value={values.eventCategory || ''}
        error={!!errors?.eventCategory}
        onChange={(value) => {
          clearErrors('eventCategory')
          setValue('eventCategory', value)
          if (value === '') {
            setError('eventCategory', { message: t('error.grant.category_assessment.field_empty') })
          } else if (isDirty) {
            trigger()
          }
        }}
      />
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.primary_source_funding_label')}</Label>
        <Controller
          name="primarySourceFunding"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectField
              {...field}
              onChange={(_, { value }) => setValue('primarySourceFunding', value as string)}
              options={PRIMARY_SOURCE_FUNDING_OPTIONS}
              error={!!errors.primarySourceFunding}
              message={errors.primarySourceFunding?.message}
              disabled={isFormDisabled}
            />
          )}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.total_events_label')}</Label>
        <Field
          name="totalEvents"
          control={control}
          type="number"
          error={!!errors.totalEvents}
          message={errors.totalEvents?.message}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
          rules={getNumberFieldRules('totalEvents')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.total_attendance_label')}</Label>
        <Field
          name="totalAttendance"
          type="number"
          control={control}
          error={!!errors.totalAttendance}
          message={errors.totalAttendance?.message}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
          rules={getNumberFieldRules('totalAttendance')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.audience_relevance_label')}</Label>
        <MarkdownField
          name="audienceRelevance"
          control={control}
          error={!!errors.audienceRelevance}
          message={
            (errors.audienceRelevance?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('audienceRelevance').length,
              limit: schema.audienceRelevance.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={getMarkdownFieldRules('audienceRelevance')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.sponsorship.showcase_label')}</Label>
        <MarkdownField
          name="showcase"
          control={control}
          error={!!errors.showcase}
          message={
            (errors.showcase?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('showcase').length,
              limit: schema.showcase.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={getMarkdownFieldRules('showcase')}
        />
      </ContentSection>
    </div>
  )
}
