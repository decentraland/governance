import React, { useEffect } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { userModifiedForm } from '../../entities/Proposal/utils'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestGeneralInfoSchema } from './GrantRequestSchema'
import GrantRequestSection from './GrantRequestSection'

export type GrantRequestGeneralInfo = {
  description: string
  specification: string
}

export const INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE: GrantRequestGeneralInfo = { description: '', specification: '' }

const schema = GrantRequestGeneralInfoSchema
const validate = createValidator<GrantRequestGeneralInfo>({
  description: (state) => ({
    description:
      assert(
        state.description.length <= schema.description.maxLength,
        'error.grant.general_info.description_too_large'
      ) ||
      assert(state.description.length > 0, 'error.grant.general_info.description_empty') ||
      assert(
        state.description.length > schema.description.minLength,
        'error.grant.general_info.description_too_short'
      ) ||
      undefined,
  }),
  specification: (state) => ({
    specification:
      assert(
        state.specification.length <= schema.specification.maxLength,
        'error.grant.general_info.specification_too_large'
      ) ||
      assert(state.specification.length > 0, 'error.grant.general_info.specification_empty') ||
      assert(
        state.specification.length > schema.specification.minLength,
        'error.grant.general_info.specification_too_short'
      ) ||
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
}

export default function GrantRequestGeneralInfoSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE)
  const isFormEdited = userModifiedForm(state.value, INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE)

  useEffect(() => {
    onValidation({ ...state.value }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <GrantRequestSection
      onBlur={() => editor.validate()}
      validated={state.validated}
      isFormEdited={isFormEdited}
      sectionTitle={'General Information'}
      sectionNumber={2}
    >
      <div className="GrantRequestSection__Content">
        <ContentSection className="GrantRequestSection__MarkdownField">
          <Label className="GrantRequestSection__Label">{t('page.submit_grant.general_info.description_label')}</Label>
          <span className="GrantRequestSection__Sublabel">
            {t('page.submit_grant.general_info.description_detail')}
          </span>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.description}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ description: value })}
            onBlur={() => editor.set({ description: state.value.description.trim() })}
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
        <ContentSection className="GrantRequestSection__MarkdownField">
          <Label className="GrantRequestSection__Label">
            {t('page.submit_grant.general_info.specification_label')}
          </Label>
          <span className="GrantRequestSection__Sublabel">
            {t('page.submit_grant.general_info.specification_detail')}
          </span>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.specification}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ specification: value })}
            onBlur={() => editor.set({ specification: state.value.specification.trim() })}
            error={!!state.error.specification}
            message={
              t(state.error.specification) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.specification.length,
                limit: schema.specification.maxLength,
              })
            }
            disabled={isFormDisabled}
          />
        </ContentSection>
      </div>
    </GrantRequestSection>
  )
}
