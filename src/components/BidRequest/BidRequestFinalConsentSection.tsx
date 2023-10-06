import { useEffect, useState } from 'react'

import { userModifiedForm } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import Label from '../Common/Typography/Label'
import CheckboxField from '../GrantRequest/CheckboxField'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

export type BidRequestFinalConsent = {
  contentPolicy: boolean
  termsOfUse: boolean
  codeOfEthics: boolean
}

export const INITIAL_BID_REQUEST_FINAL_CONSENT_STATE: BidRequestFinalConsent = {
  contentPolicy: false,
  termsOfUse: false,
  codeOfEthics: false,
}

const getAcceptedAllTerms = (state: BidRequestFinalConsent): boolean => {
  return (state.codeOfEthics && state.contentPolicy && state.termsOfUse) || false
}

interface Props {
  onValidation: (sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
}

export default function BidRequestFinalConsentSection({ onValidation, isFormDisabled, sectionNumber }: Props) {
  const t = useFormatMessage()
  const [state, setState] = useState(INITIAL_BID_REQUEST_FINAL_CONSENT_STATE)
  const isFormEdited = userModifiedForm(state, INITIAL_BID_REQUEST_FINAL_CONSENT_STATE)
  const acceptedAllTerms = getAcceptedAllTerms(state)

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
    </ProjectRequestSection>
  )
}
