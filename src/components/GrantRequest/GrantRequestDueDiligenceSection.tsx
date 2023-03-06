import React, { useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEqual from 'lodash/isEqual'
import sumBy from 'lodash/sumBy'

import {
  BudgetBreakdownItem as BudgetBreakdownItemType,
  GrantRequest,
  GrantRequestDueDiligence,
} from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import SubLabel from '../Common/SubLabel'

import AddBox from './AddBox'
import AddModal from './AddModal'
import BudgetBreakdownItem from './BudgetBreakdownItem'
import './GrantRequestDueDiligenceSection.css'
import GrantRequestSection from './GrantRequestSection'

export const INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE: GrantRequestDueDiligence = {
  budgetBreakdown: [],
}

interface Props {
  sectionNumber: number
  funding: GrantRequest['funding']
  onValidation: (data: GrantRequestDueDiligence, sectionValid: boolean) => void
}

export default function GrantRequestDueDiligenceSection({ sectionNumber, funding, onValidation }: Props) {
  const t = useFormatMessage()
  const [DueDiligenceState, setDueDiligenceState] = useState(INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE)
  const isFormEdited = userModifiedForm(DueDiligenceState, INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE)
  const [isModalOpen, setModalOpen] = useState(false)

  const handleSubmitItem = (item: BudgetBreakdownItemType) => {
    setDueDiligenceState((prevState) => ({ budgetBreakdown: [...prevState.budgetBreakdown, item] }))
  }

  const fundingLeftToDisclose = useMemo(
    () => Number(funding) - Number(sumBy(DueDiligenceState.budgetBreakdown, 'estimatedBudget')),
    [DueDiligenceState.budgetBreakdown, funding]
  )

  const isCompleted = funding >= 0 && Number(fundingLeftToDisclose) <= 0

  useEffect(() => {
    onValidation(DueDiligenceState, isCompleted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DueDiligenceState, isCompleted])

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
        <SubLabel>
          {t('page.submit_grant.due_diligence.budget_breakdown_detail', { value: fundingLeftToDisclose })}
        </SubLabel>
        {DueDiligenceState.budgetBreakdown.map((item, index) => (
          <BudgetBreakdownItem
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
          {t('page.submit_grant.due_diligence.budget_breakdown_add_concept')}
        </AddBox>
        <span className="GrantRequestSection__ExampleLabel">
          {t('page.submit_grant.due_diligence.budget_breakdown_example')}
        </span>
      </div>
      <AddModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitItem}
        fundingLeftToDisclose={fundingLeftToDisclose}
      />
    </GrantRequestSection>
  )
}
