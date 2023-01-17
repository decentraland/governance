import React, { useEffect } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { isValidGrantBudget } from '../../entities/Grant/utils'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestFundingSchema } from './GrantRequestSchema'
import GrantRequestSection from './GrantRequestSection'

const schema = GrantRequestFundingSchema
export type GrantRequestFundingState = {
  funding: string | number
}

export const INITIAL_GRANT_REQUEST_FUNDING_STATE: GrantRequestFundingState = { funding: String(schema.funding) }

const validate = createValidator<GrantRequestFundingState>({
  funding: (state) => ({
    funding:
      assert(!state.funding || Number.isFinite(asNumber(state.funding)), 'error.grant.size_invalid') ||
      assert(!state.funding || asNumber(state.funding) >= schema.funding.minimum, 'error.grant.size_too_low') ||
      assert(!state.funding || asNumber(state.funding) <= schema.funding.maximum, 'error.grant.size_too_big') ||
      assert(
        !state.funding || (!!state.funding && isValidGrantBudget(Number(state.funding))),
        'error.grant.size_tier_invalid'
      ) ||
      undefined,
  }),
})

const edit = (state: GrantRequestFundingState, props: Partial<GrantRequestFundingState>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: GrantRequestFundingState) => void
}

export default function GrantRequestFundingSection({ onValidation }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_GRANT_REQUEST_FUNDING_STATE)
  const isFormEdited = userModifiedForm(state.value, INITIAL_GRANT_REQUEST_FUNDING_STATE)

  useEffect(() => {
    if (state.validated) {
      onValidation({ ...state.value })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  return (
    <GrantRequestSection
      onBlur={() => editor.validate()}
      validated={state.validated}
      isFormEdited={isFormEdited}
      sectionTitle={'Funding'}
      sectionNumber={1}
    >
      <div className="GrantRequestSection__Content">
        <ContentSection className="GrantSize">
          <Label>{t('page.submit_grant.size_label')}</Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_grant.size_detail')}
          </Paragraph>
          <Field
            type="number"
            value={state.value.funding}
            onChange={(_, { value }) => editor.set({ funding: value })}
            onBlur={() => editor.set({ funding: state.value.funding })}
            error={!!state.error.funding}
            action={
              <Paragraph tiny secondary>
                USD
              </Paragraph>
            }
            onAction={() => null}
            message={t(state.error.funding)}
            disabled={false} //TODO receive property from parent on submit
          />
        </ContentSection>
      </div>
    </GrantRequestSection>
  )
}
