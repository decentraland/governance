import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import isEmail from 'validator/lib/isEmail'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { GrantRequestGeneralInfo, GrantRequestGeneralInfoSchema } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Field from '../Common/Form/Field'
import MarkdownField from '../Common/Form/MarkdownField'
import SubLabel from '../Common/SubLabel'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'
import PostLabel from '../PostLabel'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'
import CoAuthors from '../Proposal/Submit/CoAuthor/CoAuthors'

export const INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE: GrantRequestGeneralInfo = {
  title: '',
  abstract: '',
  description: '',
  beneficiary: '',
  email: '',
  roadmap: '',
}

const schema = GrantRequestGeneralInfoSchema

interface Props {
  onValidation: (data: GrantRequestGeneralInfo, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
}

export default function GrantRequestGeneralInfoSection({ onValidation, isFormDisabled, sectionNumber }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    setValue,
    watch,
  } = useForm<GrantRequestGeneralInfo>({
    defaultValues: INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  useEffect(() => {
    onValidation({ ...(values as GrantRequestGeneralInfo) }, isValid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, isValid])

  return (
    <ProjectRequestSection
      validated={isValid}
      isFormEdited={isDirty}
      sectionTitle={t('page.submit_grant.general_info.title')}
      sectionNumber={sectionNumber}
    >
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.general_info.title_label')}</Label>
        <SubLabel>{t('page.submit_grant.general_info.title_detail')}</SubLabel>
        <Field
          name="title"
          control={control}
          placeholder={t('page.submit_grant.general_info.title_placeholder')}
          error={!!errors.title}
          message={
            (errors.title?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('title').length,
              limit: schema.title.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={{
            required: { value: true, message: t('error.grant.title_empty') },
            minLength: {
              value: schema.title.minLength,
              message: t('error.grant.title_too_short'),
            },
            maxLength: {
              value: schema.title.maxLength,
              message: t('error.grant.title_too_large'),
            },
          }}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.general_info.abstract_label')}</Label>
        <SubLabel>{t('page.submit_grant.general_info.abstract_detail')}</SubLabel>
        <MarkdownField
          name="abstract"
          control={control}
          placeholder={t('page.submit_grant.general_info.abstract_placeholder')}
          error={!!errors.abstract}
          message={
            (errors.abstract?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('abstract').length,
              limit: schema.abstract.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={{
            required: { value: true, message: t('error.grant.general_info.abstract_empty') },
            minLength: {
              value: schema.abstract.minLength,
              message: t('error.grant.general_info.abstract_too_short'),
            },
            maxLength: {
              value: schema.abstract.maxLength,
              message: t('error.grant.general_info.abstract_too_large'),
            },
          }}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.general_info.description_label')}</Label>
        <SubLabel>{t('page.submit_grant.general_info.description_detail')}</SubLabel>
        <MarkdownField
          name="description"
          control={control}
          error={!!errors.description}
          message={
            (errors.description?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('description').length,
              limit: schema.description.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={{
            required: { value: true, message: t('error.grant.general_info.description_empty') },
            minLength: {
              value: schema.description.minLength,
              message: t('error.grant.general_info.description_too_short'),
            },
            maxLength: {
              value: schema.description.maxLength,
              message: t('error.grant.general_info.description_too_large'),
            },
          }}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.general_info.beneficiary_label')}</Label>
        <SubLabel>{t('page.submit_grant.general_info.beneficiary_detail')}</SubLabel>
        <Field
          name="beneficiary"
          control={control}
          type="address"
          message={errors.beneficiary?.message}
          error={!!errors.beneficiary}
          disabled={isFormDisabled}
          rules={{
            required: { value: true, message: t('error.grant.general_info.beneficiary_empty') },
            validate: (value: string) => {
              if (!isEthereumAddress(value)) {
                return t('error.grant.general_info.beneficiary_invalid')
              }
            },
          }}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.general_info.email_label')}</Label>
        <SubLabel>{t('page.submit_grant.general_info.email_detail')}</SubLabel>
        <Field
          name="email"
          control={control}
          type="email"
          placeholder={t('page.submit_grant.general_info.email_placeholder')}
          message={errors.email?.message}
          error={!!errors.email}
          disabled={isFormDisabled}
          rules={{
            required: { value: true, message: t('error.grant.general_info.email_empty') },
            validate: (value: string) => {
              if (!isEmail(value)) {
                return t('error.grant.general_info.email_invalid')
              }
            },
          }}
        />
        <PostLabel>{t('page.submit_grant.general_info.email_note')}</PostLabel>
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.general_info.roadmap_label')}</Label>
        <SubLabel>{t('page.submit_grant.general_info.roadmap_detail')}</SubLabel>
        <MarkdownField
          name="roadmap"
          control={control}
          placeholder={t('page.submit_grant.general_info.roadmap_placeholder')}
          error={!!errors.roadmap}
          message={
            (errors.roadmap?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('roadmap').length,
              limit: schema.roadmap.maxLength,
            })
          }
          disabled={isFormDisabled}
          rules={{
            required: { value: true, message: t('error.grant.general_info.roadmap_empty') },
            minLength: {
              value: schema.roadmap.minLength,
              message: t('error.grant.general_info.roadmap_too_short'),
            },
            maxLength: {
              value: schema.roadmap.maxLength,
              message: t('error.grant.general_info.roadmap_too_large'),
            },
          }}
        />
      </ContentSection>
      <ContentSection>
        <CoAuthors
          setCoAuthors={(addresses?: string[]) => setValue('coAuthors', addresses)}
          isDisabled={isFormDisabled}
        />
      </ContentSection>
    </ProjectRequestSection>
  )
}
