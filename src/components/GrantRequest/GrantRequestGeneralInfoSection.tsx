import React, { useEffect } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { userModifiedForm } from '../../entities/Proposal/utils'
import MarkdownNotice from '../Form/MarkdownNotice'
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
      assert(state.description.length <= schema.description.maxLength, 'error.grant.description_too_large') ||
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
        <ContentSection>
          <Label>
            {t('page.submit_grant.description_label')}
            <MarkdownNotice />
          </Label>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.description}
            placeholder={t('page.submit_grant.description_placeholder')}
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
        <ContentSection>
          <Label>
            {t('page.submit_grant.specification_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_grant.specification_detail')}
          </Paragraph>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.specification}
            placeholder={t('page.submit_grant.specification_placeholder')}
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
