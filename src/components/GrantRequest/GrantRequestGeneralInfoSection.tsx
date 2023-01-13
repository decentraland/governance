import React, { useEffect } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { userModifiedForm } from '../../entities/Proposal/utils'
import MarkdownNotice from '../Form/MarkdownNotice'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestGeneralInfoSchema } from './GrantRequestSchema'
import GrantRequestSection from './GrantRequestSection'

export type GrantRequestGeneralInfoState = {
  description: string
}

export const INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE: GrantRequestGeneralInfoState = { description: '' }

const schema = GrantRequestGeneralInfoSchema
const validate = createValidator<GrantRequestGeneralInfoState>({
  description: (state) => ({
    description:
      assert(state.description.length <= schema.description.maxLength, 'error.grant.description_too_large') ||
      undefined,
  }),
})

const edit = (state: GrantRequestGeneralInfoState, props: Partial<GrantRequestGeneralInfoState>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValid: (data: GrantRequestGeneralInfoState) => void
}

export default function GrantRequestGeneralInfoSection({ onValid }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE)
  const formEdited = userModifiedForm(state.value, INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE)

  useEffect(() => {
    if (state.validated) {
      onValid({ ...state.value })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <GrantRequestSection
      onBlur={() => editor.validate()}
      validated={state.validated}
      formEdited={formEdited}
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
            disabled={false} //TODO receive property from parent on submit
          />
        </ContentSection>
      </div>
    </GrantRequestSection>
  )
}
