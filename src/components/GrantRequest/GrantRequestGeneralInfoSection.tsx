import React, { useCallback, useEffect, useState } from 'react'

import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import isEmail from 'validator/lib/isEmail'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { GrantRequestGeneralInfo, GrantRequestGeneralInfoSchema } from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import Label from '../Common/Label'
import SubLabel from '../Common/SubLabel'
import { ContentSection } from '../Layout/ContentLayout'
import CoAuthors from '../Proposal/Submit/CoAuthor/CoAuthors'

import GrantRequestSection from './GrantRequestSection'

export const INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE: GrantRequestGeneralInfo = {
  title: '',
  abstract: '',
  description: '',
  beneficiary: '',
  email: '',
  roadmap: '',
}

const schema = GrantRequestGeneralInfoSchema
const validate = createValidator<GrantRequestGeneralInfo>({
  title: (state) => ({
    title:
      assert(state.title.length <= schema.title.maxLength, 'error.grant.title_too_large') ||
      assert(state.title.length > 0, 'error.grant.title_empty') ||
      assert(state.title.length >= schema.title.minLength, 'error.grant.title_too_short') ||
      undefined,
  }),
  abstract: (state) => ({
    abstract:
      assert(state.abstract.length <= schema.abstract.maxLength, 'error.grant.general_info.abstract_too_large') ||
      assert(state.abstract.length > 0, 'error.grant.general_info.abstract_empty') ||
      assert(state.abstract.length >= schema.abstract.minLength, 'error.grant.general_info.abstract_too_short') ||
      undefined,
  }),
  description: (state) => ({
    description:
      assert(
        state.description.length <= schema.description.maxLength,
        'error.grant.general_info.description_too_large'
      ) ||
      assert(state.description.length > 0, 'error.grant.general_info.description_empty') ||
      assert(
        state.description.length >= schema.description.minLength,
        'error.grant.general_info.description_too_short'
      ) ||
      undefined,
  }),
  beneficiary: (state) => ({
    beneficiary:
      assert(state.beneficiary !== '', 'error.grant.general_info.beneficiary_empty') ||
      assert(
        !state.beneficiary || isEthereumAddress(state.beneficiary),
        'error.grant.general_info.beneficiary_invalid'
      ),
  }),
  email: (state) => ({
    email:
      assert(state.email !== '', 'error.grant.general_info.email_empty') ||
      assert(!state.email || isEmail(state.email), 'error.grant.general_info.email_invalid'),
  }),
  roadmap: (state) => ({
    roadmap:
      assert(state.roadmap.length <= schema.roadmap.maxLength, 'error.grant.general_info.roadmap_too_large') ||
      assert(state.roadmap.length > 0, 'error.grant.general_info.roadmap_empty') ||
      assert(state.roadmap.length >= schema.roadmap.minLength, 'error.grant.general_info.roadmap_too_short') ||
      undefined,
  }),
})

const edit = (state: GrantRequestGeneralInfo, props: Partial<GrantRequestGeneralInfo>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: GrantRequestGeneralInfo, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
}

type Fields = keyof Omit<GrantRequestGeneralInfo, 'coAuthors' | 'specification' | 'personnel'>

export default function GrantRequestGeneralInfoSection({ onValidation, isFormDisabled, sectionNumber }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE)
  const isFormEdited = userModifiedForm(state.value, INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE)
  const [checkedFields, setCheckedFields] = useState<Record<Fields, boolean>>({
    title: false,
    abstract: false,
    description: false,
    beneficiary: false,
    email: false,
    roadmap: false,
  })

  const canValidate = useCallback(() => Object.values(checkedFields).every((value) => value), [checkedFields])

  const onFieldBlur = (field: Fields) => {
    setCheckedFields({ ...checkedFields, [field]: true })
    editor.set({ [field]: state.value[field].trim() })
  }

  useEffect(() => {
    onValidation({ ...state.value }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  useEffect(() => {
    if (canValidate()) {
      editor.validate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canValidate])

  return (
    <GrantRequestSection
      validated={state.validated}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.general_info.title')}
      sectionNumber={sectionNumber}
    >
      <div className="GrantRequestSection__Content">
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.general_info.title_label')}</Label>
          <span className="GrantRequestSection__Sublabel GrantRequestSection__TitleSubLabel">
            {t('page.submit_grant.general_info.title_detail')}
          </span>
          <Field
            value={state.value.title}
            placeholder={t('page.submit_grant.general_info.title_placeholder')}
            onChange={(_, { value }) => editor.set({ title: value })}
            onBlur={() => onFieldBlur('title')}
            error={!!state.error.title}
            message={
              t(state.error.title) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.title.length,
                limit: schema.title.maxLength,
              })
            }
            disabled={isFormDisabled}
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.general_info.abstract_label')}</Label>
          <SubLabel>{t('page.submit_grant.general_info.abstract_detail')}</SubLabel>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.abstract}
            placeholder={t('page.submit_grant.general_info.abstract_placeholder')}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ abstract: value })}
            onBlur={() => onFieldBlur('abstract')}
            error={!!state.error.abstract}
            message={
              t(state.error.abstract) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.abstract.length,
                limit: schema.abstract.maxLength,
              })
            }
            disabled={isFormDisabled}
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.general_info.description_label')}</Label>
          <SubLabel>{t('page.submit_grant.general_info.description_detail')}</SubLabel>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.description}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ description: value })}
            onBlur={() => onFieldBlur('description')}
            error={!!state.error.description}
            message={
              t(state.error.description) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.description.length,
                limit: schema.description.maxLength,
              })
            }
            disabled={isFormDisabled}
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.general_info.beneficiary_label')}</Label>
          <SubLabel>{t('page.submit_grant.general_info.beneficiary_detail')}</SubLabel>
          <Field
            type="address"
            value={state.value.beneficiary}
            onChange={(_, { value }) => editor.set({ beneficiary: value }, { validate: false })}
            onBlur={() => onFieldBlur('beneficiary')}
            message={t(state.error.beneficiary)}
            error={!!state.error.beneficiary}
            disabled={isFormDisabled}
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>
            <span className="EmailLabel">{t('page.submit_grant.general_info.email_label')}</span>
          </Label>
          <SubLabel>{t('page.submit_grant.general_info.email_detail')}</SubLabel>
          <Field
            type="email"
            value={state.value.email}
            placeholder={t('page.submit_grant.general_info.email_placeholder')}
            onChange={(_, { value }) => editor.set({ email: value })}
            onBlur={() => onFieldBlur('email')}
            message={t(state.error.email)}
            error={!!state.error.email}
            disabled={isFormDisabled}
          />
          <p className="GrantRequestSection__EmailNote">{t('page.submit_grant.general_info.email_note')}</p>
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.general_info.roadmap_label')}</Label>
          <SubLabel>{t('page.submit_grant.general_info.roadmap_detail')}</SubLabel>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.roadmap}
            placeholder={t('page.submit_grant.general_info.roadmap_placeholder')}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ roadmap: value })}
            onBlur={() => onFieldBlur('roadmap')}
            error={!!state.error.roadmap}
            message={
              t(state.error.roadmap) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.roadmap.length,
                limit: schema.roadmap.maxLength,
              })
            }
            disabled={isFormDisabled}
          />
        </ContentSection>
        <ContentSection onBlur={() => onValidation({ ...state.value }, state.validated)}>
          <CoAuthors
            setCoAuthors={(addresses?: string[]) => editor.set({ coAuthors: addresses })}
            isDisabled={isFormDisabled}
          />
        </ContentSection>
      </div>
    </GrantRequestSection>
  )
}
