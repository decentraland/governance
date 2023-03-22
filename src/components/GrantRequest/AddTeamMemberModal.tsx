import React, { useEffect } from 'react'

import Textarea from 'decentraland-gatsby/dist/components/Form/Textarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import isURL from 'validator/lib/isURL'

import { TeamMember, TeamMemberItemSchema } from '../../entities/Grant/types'
import Label from '../Common/Label'
import { ContentSection } from '../Layout/ContentLayout'

import AddModal from './AddModal'
import './AddModal.css'

export const INITIAL_TEAM_MEMBER_ITEM: TeamMember = {
  name: '',
  role: '',
  about: '',
  relevantLink: '',
}

const schema = TeamMemberItemSchema
const validate = createValidator<TeamMember>({
  name: (state) => ({
    name:
      assert(state.name.length <= schema.name.maxLength, 'error.grant.team.name_too_large') ||
      assert(state.name.length > 0, 'error.grant.team.name_empty') ||
      assert(state.name.length >= schema.name.minLength, 'error.grant.team.name_too_short') ||
      undefined,
  }),
  role: (state) => ({
    role:
      assert(state.role.length <= schema.role.maxLength, 'error.grant.team.role_too_large') ||
      assert(state.role.length > 0, 'error.grant.team.role_empty') ||
      assert(state.role.length >= schema.role.minLength, 'error.grant.team.role_too_short') ||
      undefined,
  }),
  about: (state) => ({
    about:
      assert(state.about.length <= schema.about.maxLength, 'error.grant.team.about_too_large') ||
      assert(state.about.length > 0, 'error.grant.team.about_empty') ||
      assert(state.about.length >= schema.about.minLength, 'error.grant.team.about_too_short') ||
      undefined,
  }),
})

const edit = (state: TeamMember, props: Partial<TeamMember>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (item: TeamMember) => void
  onDelete: () => void
  selectedTeamMember: TeamMember | null
}

const AddTeamMemberModal = ({ isOpen, onClose, onSubmit, selectedTeamMember, onDelete }: Props) => {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_TEAM_MEMBER_ITEM)

  const hasInvalidUrl =
    state.value.relevantLink !== '' &&
    !!state.value.relevantLink &&
    (!isURL(state.value.relevantLink) || state.value.relevantLink?.length >= schema.relevantLink.maxLength)

  useEffect(() => {
    if (state.validated) {
      onSubmit(state.value)
      onClose()
    }
  }, [editor, onClose, onSubmit, state.validated, state.value])

  useEffect(() => {
    if (selectedTeamMember) {
      editor.set({ ...selectedTeamMember })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamMember])

  return (
    <AddModal
      title={t('page.submit_grant.team.team_modal.title')}
      isOpen={isOpen}
      onClose={onClose}
      onSecondaryClick={selectedTeamMember ? onDelete : undefined}
      onPrimaryClick={() => !hasInvalidUrl && editor.validate()}
    >
      <div>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.team.team_modal.name_label')}</Label>
          <Field
            value={state.value.name}
            placeholder={t('page.submit_grant.team.team_modal.name_placeholder')}
            onChange={(_, { value }) => editor.set({ name: value })}
            error={!!state.error.name}
            message={
              t(state.error.name) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.name.length,
                limit: schema.name.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.team.team_modal.role_label')}</Label>
          <Field
            value={state.value.role}
            placeholder={t('page.submit_grant.team.team_modal.role_placeholder')}
            onChange={(_, { value }) => editor.set({ role: value })}
            error={!!state.error.role}
            message={
              t(state.error.role) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.role.length,
                limit: schema.role.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.team.team_modal.about_label')}</Label>
          <Textarea
            value={state.value.about}
            minHeight={175}
            placeholder={t('page.submit_grant.team.team_modal.about_placeholder')}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ about: String(value) })}
            error={!!state.error.about}
            message={
              t(state.error.about) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.about.length,
                limit: schema.about.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <div className="LabelContainer">
            <Label>{t('page.submit_grant.team.team_modal.relevant_link_label')}</Label>
            <span className="Optional">{t('page.submit_grant.team.team_modal.optional_label')}</span>
          </div>
          <Field
            value={state.value.relevantLink}
            placeholder={t('page.submit_grant.team.team_modal.relevant_link_placeholder')}
            onChange={(_, { value }) => editor.set({ relevantLink: value })}
            error={hasInvalidUrl}
            message={
              (!!state.value.relevantLink && !isURL(state.value.relevantLink)
                ? t('error.grant.team.relevant_link_invalid')
                : '') +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.relevantLink?.length,
                limit: schema.relevantLink.maxLength,
              })
            }
          />
        </ContentSection>
      </div>
    </AddModal>
  )
}

export default AddTeamMemberModal
