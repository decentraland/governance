import React, { useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { isEmpty, isEqual } from 'lodash'

import {
  BudgetBreakdownItem as BudgetBreakdownItemType,
  GrantRequest,
  GrantRequestDueDilligence,
} from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import SubLabel from '../Common/SubLabel'

import AddBox from './AddBox'
import AddModal from './AddModal'
import BudgetBreakdownItem from './BudgetBreakdownItem'
import './GrantRequestDueDilligenceSection.css'
import GrantRequestSection from './GrantRequestSection'

export const INITIAL_GRANT_REQUEST_DUE_DILLIGENCE_STATE: GrantRequestDueDilligence = {
  budgetBreakdown: [],
}

interface Props {
  sectionNumber: number
  funding: GrantRequest['funding']
  onValidation: (data: GrantRequestDueDilligence) => void
}

export default function GrantRequestDueDilligenceSection({ sectionNumber, funding, onValidation }: Props) {
  const t = useFormatMessage()
  const [dueDilligenceState, setDueDilligenceState] = useState(INITIAL_GRANT_REQUEST_DUE_DILLIGENCE_STATE)
  const isFormEdited = userModifiedForm(dueDilligenceState, INITIAL_GRANT_REQUEST_DUE_DILLIGENCE_STATE)
  const [isModalOpen, setModalOpen] = useState(false)

  const handleSubmitItem = (item: BudgetBreakdownItemType) => {
    setDueDilligenceState((prevState) => ({ budgetBreakdown: [...prevState.budgetBreakdown, item] }))
  }

  useEffect(() => {
    onValidation(dueDilligenceState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueDilligenceState])

  return (
    <GrantRequestSection
      shouldFocus={false}
      validated={!isEmpty(dueDilligenceState.budgetBreakdown)}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.due_dilligence.title')}
      sectionNumber={sectionNumber}
    >
      <div className="GrantRequestSection__Content">
        <Label>{t('page.submit_grant.due_dilligence.budget_breakdown_label')}</Label>
        <SubLabel>{t('page.submit_grant.due_dilligence.budget_breakdown_detail', { value: funding })}</SubLabel>
        {dueDilligenceState.budgetBreakdown.map((item, index) => (
          <BudgetBreakdownItem
            key={`${item.concept}-${index}`}
            item={item}
            onDeleteClick={() =>
              setDueDilligenceState((prevState) => ({
                budgetBreakdown: prevState.budgetBreakdown.filter((i) => !isEqual(i, item)),
              }))
            }
          />
        ))}
        <AddBox onClick={() => setModalOpen(true)}>
          {t('page.submit_grant.due_dilligence.budget_breakdown_add_concept')}
        </AddBox>
        <span className="GrantRequestSection__ExampleLabel">
          {t('page.submit_grant.due_dilligence.budget_breakdown_example')}
        </span>
      </div>
      <AddModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmitItem} />
    </GrantRequestSection>
  )
}
