import React, { useEffect, useState } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'

import { userModifiedForm } from '../../entities/Proposal/utils'
import { ContentSection } from '../Layout/ContentLayout'

import GrantRequestSection from './GrantRequestSection'
import Label from './Label'

export type GrantRequestFinalConsent = {
  grantsFramework: boolean
  contentPolicy: boolean
  termsOfUse: boolean
  codeOfEthics: boolean
}

export const INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE: GrantRequestFinalConsent = {
  grantsFramework: false,
  contentPolicy: false,
  termsOfUse: false,
  codeOfEthics: false,
}

interface Props {
  onValidation: (sectionValid: boolean) => void
  isFormDisabled: boolean
}

export default function GrantRequestFinalConsentSection({ onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const [state, setState] = useState(INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const isFormEdited = userModifiedForm(state, INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const acceptedAllTerms = Object.values(state).every((prop) => prop)

  useEffect(() => {
    onValidation(acceptedAllTerms)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedAllTerms])

  return (
    <GrantRequestSection
      validated={acceptedAllTerms}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.final_consent.title')}
      sectionNumber={3}
    >
      <div className="GrantRequestSection__Content">
        <Label>{t('page.submit_grant.final_consent.subtitle')}</Label>
      </div>
      <div className="GrantRequestSection__Content">
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, grantsFramework: !state.grantsFramework })}
        >
          <Radio type="checkbox" checked={state.grantsFramework} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.grants_framework_label')}</Markdown>
        </ContentSection>
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, contentPolicy: !state.contentPolicy })}
        >
          <Radio type="checkbox" checked={state.contentPolicy} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.content_policy_label')}</Markdown>
        </ContentSection>
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, termsOfUse: !state.termsOfUse })}
        >
          <Radio type="checkbox" checked={state.termsOfUse} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.terms_of_use_label')}</Markdown>
        </ContentSection>
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, codeOfEthics: !state.codeOfEthics })}
        >
          <Radio type="checkbox" checked={state.codeOfEthics} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.code_of_ethics_label')}</Markdown>
        </ContentSection>
      </div>
    </GrantRequestSection>
  )
}
