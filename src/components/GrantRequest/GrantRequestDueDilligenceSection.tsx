import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { userModifiedForm } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import SubLabel from '../Common/SubLabel'

import AddBox from './AddBox'
import './GrantRequestDueDilligenceSection.css'
import GrantRequestSection from './GrantRequestSection'

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

export default function GrantRequestDueDilligenceSection() {
  const t = useFormatMessage()
  const [state] = useState(INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const isFormEdited = userModifiedForm(state, INITIAL_GRANT_REQUEST_FINAL_CONSENT_STATE)
  const acceptedAllTerms = Object.values(state).every((prop) => prop)

  return (
    <GrantRequestSection
      validated={acceptedAllTerms}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.due_dilligence.title')}
      sectionNumber={3}
    >
      <div className="GrantRequestSection__Content">
        <Label>{t('page.submit_grant.due_dilligence.budget_breakdown_label')}</Label>
        <SubLabel>{t('page.submit_grant.due_dilligence.budget_breakdown_detail', { value: 240000 })}</SubLabel>
        <AddBox>{t('page.submit_grant.due_dilligence.budget_breakdown_add_concept')}</AddBox>
      </div>
    </GrantRequestSection>
  )
}
