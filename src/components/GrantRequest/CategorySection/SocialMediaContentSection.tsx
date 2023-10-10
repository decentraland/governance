import { useCallback, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
  GrantRequestCategoryAssessment,
  SocialMediaContentQuestions,
  SocialMediaContentQuestionsSchema,
} from '../../../entities/Grant/types'
import { asNumber } from '../../../entities/Proposal/utils'
import { disableOnWheelInput } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import Label from '../../Common/Typography/Label'
import { ContentSection } from '../../Layout/ContentLayout'
import MultipleChoiceField from '../MultipleChoiceField'

const INITIAL_SOCIAL_MEDIA_CONTENT_QUESTIONS = {
  socialMediaPlatforms: null,
  audienceRelevance: '',
  totalPieces: '',
  totalPeopleImpact: '',
  relevantLink: '',
}

const SOCIAL_MEDIA_PLATFORMS_OPTIONS = [
  'instagram',
  'facebook',
  'tiktok',
  'discord',
  'youtube',
  'twitter',
  'twitch',
  'other',
]

const schema = SocialMediaContentQuestionsSchema

interface Props {
  onValidation: (data: Partial<GrantRequestCategoryAssessment>, sectionValid: boolean, isEdited: boolean) => void
  isFormDisabled: boolean
}

export default function SocialMediaContentSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    setValue,
    setError,
    trigger,
    clearErrors,
    watch,
  } = useForm<SocialMediaContentQuestions>({
    defaultValues: INITIAL_SOCIAL_MEDIA_CONTENT_QUESTIONS,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ socialMediaContent: { ...values } } as Partial<GrantRequestCategoryAssessment>, isValid, isDirty)
  }, [isValid, isDirty, onValidation, values])

  const getNumberFieldRules = useCallback(
    (field: 'totalPieces' | 'totalPeopleImpact') => ({
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

  const getTextFieldRules = useCallback(
    (field: 'audienceRelevance' | 'relevantLink') => ({
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
      <MultipleChoiceField
        label={t('page.submit_grant.category_assessment.social_media_content.social_media_platforms.label')}
        intlKey="page.submit_grant.category_assessment.social_media_content.social_media_platforms.choices"
        options={SOCIAL_MEDIA_PLATFORMS_OPTIONS}
        isFormDisabled={isFormDisabled}
        value={values.socialMediaPlatforms || ''}
        error={!!errors?.socialMediaPlatforms}
        onChange={(value) => {
          clearErrors('socialMediaPlatforms')
          setValue('socialMediaPlatforms', value)
          if (value === '') {
            setError('socialMediaPlatforms', { message: t('error.grant.category_assessment.field_empty') })
          } else if (isDirty) {
            trigger()
          }
        }}
      />
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.audience_relevance_label')}</Label>
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
          rules={getTextFieldRules('audienceRelevance')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.total_pieces_label')}</Label>
        <Field
          name="totalPieces"
          control={control}
          type="number"
          error={!!errors.totalPieces}
          message={errors.totalPieces?.message}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
          rules={getNumberFieldRules('totalPieces')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.total_impact_label')}</Label>
        <Field
          name="totalPeopleImpact"
          control={control}
          type="number"
          error={!!errors.totalPeopleImpact}
          message={errors.totalPeopleImpact?.message}
          disabled={isFormDisabled}
          onWheel={disableOnWheelInput}
          rules={getNumberFieldRules('totalPeopleImpact')}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.category_assessment.social_media_content.relevant_link_label')}</Label>
        <Field
          name="relevantLink"
          control={control}
          error={!!errors.relevantLink}
          message={errors.relevantLink?.message}
          disabled={isFormDisabled}
          rules={getTextFieldRules('relevantLink')}
        />
      </ContentSection>
    </div>
  )
}
