import { useEffect } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import { TeamMember, TeamMemberItemSchema } from '../../entities/Grant/types'
import { isHttpsURL } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import Field from '../Common/Form/Field'
import TextArea from '../Common/Form/TextArea'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'

import AddModal from './AddModal'

const INITIAL_TEAM_MEMBER_ITEM: TeamMember = {
  name: '',
  role: '',
  about: '',
  relevantLink: '',
}

const schema = TeamMemberItemSchema

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (item: TeamMember) => void
  onDelete: () => void
  selectedTeamMember: TeamMember | null
}

export default function AddTeamMemberModal({ isOpen, onClose, onSubmit, selectedTeamMember, onDelete }: Props) {
  const t = useFormatMessage()
  const {
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
  } = useForm<TeamMember>({
    defaultValues: INITIAL_TEAM_MEMBER_ITEM,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  const hasInvalidUrl =
    values.relevantLink !== '' &&
    !!values.relevantLink &&
    (!isHttpsURL(values.relevantLink) || values.relevantLink?.length >= schema.relevantLink.maxLength)

  const onSubmitForm: SubmitHandler<TeamMember> = (data) => {
    if (hasInvalidUrl) {
      return
    }

    onSubmit(data)
    onClose()
    reset()
  }

  useEffect(() => {
    if (selectedTeamMember) {
      const { name, role, about, relevantLink } = selectedTeamMember
      setValue('name', name)
      setValue('role', role)
      setValue('about', about)
      setValue('relevantLink', relevantLink)
    }
  }, [selectedTeamMember, setValue])

  return (
    <AddModal
      title={t('page.submit_grant.team.team_modal.title')}
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryClick={handleSubmit(onSubmitForm)}
      onSecondaryClick={selectedTeamMember ? onDelete : undefined}
    >
      <div>
        <ContentSection className="ProjectRequestSection__Field">
          <Label>{t('page.submit_grant.team.team_modal.name_label')}</Label>
          <Field
            name="name"
            control={control}
            placeholder={t('page.submit_grant.team.team_modal.name_placeholder')}
            error={!!errors.name}
            message={
              (errors.name?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('name').length,
                limit: schema.name.maxLength,
              })
            }
            rules={{
              required: { value: true, message: t('error.grant.team.name_empty') },
              minLength: {
                value: schema.name.minLength,
                message: t('error.grant.team.name_too_short'),
              },
              maxLength: { value: schema.name.maxLength, message: t('error.grant.team.name_too_large') },
            }}
          />
        </ContentSection>
        <ContentSection className="ProjectRequestSection__Field">
          <Label>{t('page.submit_grant.team.team_modal.role_label')}</Label>
          <Field
            name="role"
            control={control}
            placeholder={t('page.submit_grant.team.team_modal.role_placeholder')}
            error={!!errors.role}
            message={
              (errors.role?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('role').length,
                limit: schema.role.maxLength,
              })
            }
            rules={{
              required: { value: true, message: t('error.grant.team.role_empty') },
              minLength: {
                value: schema.role.minLength,
                message: t('error.grant.team.role_too_short'),
              },
              maxLength: { value: schema.role.maxLength, message: t('error.grant.team.role_too_large') },
            }}
          />
        </ContentSection>
        <ContentSection className="ProjectRequestSection__Field">
          <Label>{t('page.submit_grant.team.team_modal.about_label')}</Label>
          <TextArea
            name="about"
            control={control}
            placeholder={t('page.submit_grant.team.team_modal.about_placeholder')}
            error={errors.about?.message}
            info={t('page.submit.character_counter', {
              current: watch('about').length,
              limit: schema.about.maxLength,
            })}
            rules={{
              required: { value: true, message: t('error.grant.team.about_empty') },
              minLength: {
                value: schema.about.minLength,
                message: t('error.grant.team.about_too_short'),
              },
              maxLength: { value: schema.about.maxLength, message: t('error.grant.team.about_too_large') },
            }}
          />
        </ContentSection>
        <ContentSection className="ProjectRequestSection__Field">
          <div className="LabelContainer">
            <Label>{t('page.submit_grant.team.team_modal.relevant_link_label')}</Label>
            <span className="Optional">{t('page.submit_grant.team.team_modal.optional_label')}</span>
          </div>
          <Field
            name="relevantLink"
            control={control}
            placeholder={t('page.submit_grant.team.team_modal.relevant_link_placeholder')}
            error={!!errors.relevantLink}
            message={
              (errors.relevantLink?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: (watch('relevantLink') || '').length,
                limit: schema.relevantLink.maxLength,
              })
            }
            rules={{
              maxLength: {
                value: schema.relevantLink.maxLength,
                message: t('error.grant.team.relevant_link_invalid'),
              },
              validate: (value: string) => {
                if (value && value !== '' && !isHttpsURL(value)) {
                  return t('error.grant.team.relevant_link_invalid')
                }
              },
            }}
          />
        </ContentSection>
      </div>
    </AddModal>
  )
}
