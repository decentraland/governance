import React, { useEffect, useState } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { NewGrantCategory } from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import { Checkbox } from '../Checkbox/Checkbox'
import { ContentSection } from '../Layout/ContentLayout'

import './GrantRequestFinalConsentSection.css'
import GrantRequestSection from './GrantRequestSection'
import Label from './Label'

export type GrantRequestFinalConsent = {
  grantsFramework: boolean
  contentPolicy: boolean
  termsOfUse: boolean
  codeOfEthics: boolean
  platformAgreement: boolean
  documentationAgreement: boolean
}

export const INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE: GrantRequestFinalConsent = {
  grantsFramework: false,
  contentPolicy: false,
  termsOfUse: false,
  codeOfEthics: false,
  platformAgreement: false,
  documentationAgreement: false,
}

const getAcceptedAllTerms = (category: NewGrantCategory | null, state: GrantRequestFinalConsent): boolean => {
  if (category === NewGrantCategory.Documentation) {
    return (
      state.codeOfEthics &&
      state.contentPolicy &&
      state.grantsFramework &&
      state.termsOfUse &&
      state.documentationAgreement
    )
  }

  if (category === NewGrantCategory.Platform) {
    return (
      state.codeOfEthics && state.contentPolicy && state.grantsFramework && state.termsOfUse && state.platformAgreement
    )
  }

  return (state.codeOfEthics && state.contentPolicy && state.grantsFramework && state.termsOfUse) || false
}

interface Props {
  category: NewGrantCategory | null
  onValidation: (sectionValid: boolean) => void
  isFormDisabled: boolean
}

export default function GrantRequestFinalConsentSection({ category, onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()
  const [state, setState] = useState(INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const isFormEdited = userModifiedForm(state, INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const acceptedAllTerms = getAcceptedAllTerms(category, state)

  useEffect(() => {
    onValidation(acceptedAllTerms)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedAllTerms])

  return (
    <GrantRequestSection
      validated={acceptedAllTerms}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.final_consent.title')}
      sectionNumber={category === NewGrantCategory.Platform ? 3 : 4}
    >
      <div className="GrantRequestSection__Content">
        <Label>{t('page.submit_grant.final_consent.subtitle')}</Label>
      </div>
      <div className="GrantRequestSection__Content">
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, grantsFramework: !state.grantsFramework })}
        >
          <Checkbox checked={state.grantsFramework} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.grants_framework_label')}</Markdown>
        </ContentSection>
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, contentPolicy: !state.contentPolicy })}
        >
          <Checkbox checked={state.contentPolicy} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.content_policy_label')}</Markdown>
        </ContentSection>
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, termsOfUse: !state.termsOfUse })}
        >
          <Checkbox checked={state.termsOfUse} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.terms_of_use_label')}</Markdown>
        </ContentSection>
        <ContentSection
          className="GrantRequestSection__Checkbox"
          onClick={() => setState({ ...state, codeOfEthics: !state.codeOfEthics })}
        >
          <Checkbox checked={state.codeOfEthics} disabled={isFormDisabled} />
          <Markdown>{t('page.submit_grant.final_consent.code_of_ethics_label')}</Markdown>
        </ContentSection>
        {category === NewGrantCategory.Platform && (
          <ContentSection
            className="GrantRequestSection__Checkbox"
            onClick={() => setState({ ...state, platformAgreement: !state.platformAgreement })}
          >
            <Checkbox checked={state.platformAgreement} disabled={isFormDisabled} />
            <Markdown>{t('page.submit_grant.final_consent.platform_category_label')}</Markdown>
          </ContentSection>
        )}
        {category === NewGrantCategory.Documentation && (
          <ContentSection
            className="GrantRequestSection__Checkbox"
            onClick={() => setState({ ...state, documentationAgreement: !state.documentationAgreement })}
          >
            <Checkbox checked={state.documentationAgreement} disabled={isFormDisabled} />
            <Markdown>{t('page.submit_grant.final_consent.documentation_category_label')}</Markdown>
          </ContentSection>
        )}
      </div>
    </GrantRequestSection>
  )
}
