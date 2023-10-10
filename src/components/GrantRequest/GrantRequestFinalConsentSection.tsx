import { useEffect, useState } from 'react'

import { NewGrantCategory } from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import Label from '../Common/Typography/Label'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import CheckboxField from './CheckboxField'

export type GrantRequestFinalConsent = {
  grantsFramework: boolean
  contentPolicy: boolean
  termsOfUse: boolean
  codeOfEthics: boolean
  platformLicenseAgreement: boolean
  platformDocumentationAgreement: boolean
  documentationAgreement: boolean
}

export const INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE: GrantRequestFinalConsent = {
  grantsFramework: false,
  contentPolicy: false,
  termsOfUse: false,
  codeOfEthics: false,
  platformLicenseAgreement: false,
  platformDocumentationAgreement: false,
  documentationAgreement: false,
}

const getAcceptedAllTerms = (category: NewGrantCategory | null, state: GrantRequestFinalConsent): boolean => {
  const generalTermsAccepted =
    (state.codeOfEthics && state.contentPolicy && state.grantsFramework && state.termsOfUse) || false

  if (category === NewGrantCategory.Documentation) {
    return generalTermsAccepted && state.documentationAgreement
  }

  if (category === NewGrantCategory.Platform) {
    return generalTermsAccepted && state.platformLicenseAgreement && state.platformDocumentationAgreement
  }

  return generalTermsAccepted
}

interface Props {
  category: NewGrantCategory | null
  onValidation: (sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
}

export default function GrantRequestFinalConsentSection({
  category,
  onValidation,
  isFormDisabled,
  sectionNumber,
}: Props) {
  const t = useFormatMessage()
  const [state, setState] = useState(INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const isFormEdited = userModifiedForm(state, INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const acceptedAllTerms = getAcceptedAllTerms(category, state)

  useEffect(() => {
    onValidation(acceptedAllTerms)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedAllTerms])

  return (
    <ProjectRequestSection
      validated={acceptedAllTerms}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.final_consent.title')}
      sectionNumber={sectionNumber}
    >
      <Label>{t('page.submit_grant.final_consent.subtitle')}</Label>
      <CheckboxField
        onClick={() => setState({ ...state, grantsFramework: !state.grantsFramework })}
        checked={state.grantsFramework}
        disabled={isFormDisabled}
      >
        {t('page.submit_grant.final_consent.grants_framework_label')}
      </CheckboxField>
      <CheckboxField
        onClick={() => setState({ ...state, contentPolicy: !state.contentPolicy })}
        checked={state.contentPolicy}
        disabled={isFormDisabled}
      >
        {t('page.submit_grant.final_consent.content_policy_label')}
      </CheckboxField>
      <CheckboxField
        onClick={() => setState({ ...state, termsOfUse: !state.termsOfUse })}
        checked={state.termsOfUse}
        disabled={isFormDisabled}
      >
        {t('page.submit_grant.final_consent.terms_of_use_label')}
      </CheckboxField>
      <CheckboxField
        onClick={() => setState({ ...state, codeOfEthics: !state.codeOfEthics })}
        checked={state.codeOfEthics}
        disabled={isFormDisabled}
      >
        {t('page.submit_grant.final_consent.code_of_ethics_label')}
      </CheckboxField>
      {category === NewGrantCategory.Platform && (
        <>
          <CheckboxField
            onClick={() => setState({ ...state, platformLicenseAgreement: !state.platformLicenseAgreement })}
            checked={state.platformLicenseAgreement}
            disabled={isFormDisabled}
          >
            {t('page.submit_grant.final_consent.platform_category_license_label')}
          </CheckboxField>
          <CheckboxField
            onClick={() =>
              setState({ ...state, platformDocumentationAgreement: !state.platformDocumentationAgreement })
            }
            checked={state.platformDocumentationAgreement}
            disabled={isFormDisabled}
          >
            {t('page.submit_grant.final_consent.platform_category_documentation_label')}
          </CheckboxField>
        </>
      )}
      {category === NewGrantCategory.Documentation && (
        <CheckboxField
          onClick={() => setState({ ...state, documentationAgreement: !state.documentationAgreement })}
          checked={state.documentationAgreement}
          disabled={isFormDisabled}
        >
          {t('page.submit_grant.final_consent.documentation_category_label')}
        </CheckboxField>
      )}
    </ProjectRequestSection>
  )
}
