import React, { useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEqual from 'lodash/isEqual'
import sumBy from 'lodash/sumBy'

import {
  BudgetBreakdownConcept as BudgetBreakdownConceptType,
  GrantRequest,
  GrantRequestDueDiligence,
} from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import SubLabel from '../Common/SubLabel'

import AddBox from './AddBox'
import AddBudgetBreakdownModal from './AddBudgetBreakdownModal'
import BudgetBreakdownConcept from './BudgetBreakdownConcept'
import './GrantRequestDueDiligenceSection.css'
import GrantRequestSection from './GrantRequestSection'

export const INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE: GrantRequestDueDiligence = {
  budgetBreakdown: [],
}

interface Props {
  sectionNumber: number
  funding: GrantRequest['funding']
  onValidation: (data: GrantRequestDueDiligence, sectionValid: boolean) => void
  projectDuration: GrantRequest['projectDuration']
}

export default function GrantRequestDueDiligenceSection({
  sectionNumber,
  funding,
  projectDuration,
  onValidation,
}: Props) {
  const t = useFormatMessage()
  const [dueDiligenceState, setDueDiligenceState] = useState(INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE)
  const isFormEdited = userModifiedForm(dueDiligenceState, INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE)
  const [isModalOpen, setModalOpen] = useState(false)

  const handleSubmitItem = (item: BudgetBreakdownConceptType) => {
    setDueDiligenceState((prevState) => ({ budgetBreakdown: [...prevState.budgetBreakdown, item] }))
  }

  const fundingLeftToDisclose = useMemo(
    () => Number(funding) - Number(sumBy(dueDiligenceState.budgetBreakdown, 'estimatedBudget')),
    [dueDiligenceState.budgetBreakdown, funding]
  )

  const isCompleted = funding >= 0 && Number(fundingLeftToDisclose) <= 0

  useEffect(() => {
    onValidation(dueDiligenceState, isCompleted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueDiligenceState, isCompleted])

  return (
    <GrantRequestSection
      shouldFocus={false}
      validated={isCompleted}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.due_diligence.title')}
      sectionNumber={sectionNumber}
    >
      <div className="GrantRequestSection__Content">
        <Label>{t('page.submit_grant.due_diligence.budget_breakdown_label')}</Label>
        <SubLabel isMarkdown>
          {t('page.submit_grant.due_diligence.budget_breakdown_detail', { value: fundingLeftToDisclose })}
        </SubLabel>
        {dueDiligenceState.budgetBreakdown.map((item, index) => (
          <BudgetBreakdownConcept
            key={`${item.concept}-${index}`}
            item={item}
            onDeleteClick={() =>
              setDueDiligenceState((prevState) => ({
                budgetBreakdown: prevState.budgetBreakdown.filter((i) => !isEqual(i, item)),
              }))
            }
          />
        ))}
        <AddBox disabled={isCompleted} onClick={() => setModalOpen(true)}>
          {isCompleted || funding <= 0
            ? t('page.submit_grant.due_diligence.budget_breakdown_no_funds_left')
            : t('page.submit_grant.due_diligence.budget_breakdown_add_concept')}
        </AddBox>
        <span className="GrantRequestSection__ExampleLabel">
          {t('page.submit_grant.due_diligence.budget_breakdown_example')}
        </span>
      </div>
      {isModalOpen && (
        <AddBudgetBreakdownModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitItem}
          fundingLeftToDisclose={fundingLeftToDisclose}
          projectDuration={projectDuration}
        />
      )}
    </GrantRequestSection>
  )
}
