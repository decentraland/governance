import { useCallback, useEffect, useMemo, useState } from 'react'

import sumBy from 'lodash/sumBy'

import {
  BudgetBreakdownConcept as BudgetBreakdownConceptType,
  GrantRequest,
  GrantRequestDueDiligence,
} from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import SubLabel from '../Common/SubLabel'
import Label from '../Common/Typography/Label'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import AddBox from './AddBox'
import AddBudgetBreakdownModal from './AddBudgetBreakdownModal'
import BreakdownItem from './BreakdownItem'
import './GrantRequestDueDiligenceSection.css'

export const INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE: GrantRequestDueDiligence = {
  budgetBreakdown: [],
}

interface Props {
  sectionNumber: number
  funding?: number
  onValidation: (data: GrantRequestDueDiligence, sectionValid: boolean) => void
  projectDuration: GrantRequest['projectDuration']
  isDisabled?: boolean
}

export default function GrantRequestDueDiligenceSection({
  sectionNumber,
  funding,
  projectDuration,
  onValidation,
  isDisabled = false,
}: Props) {
  const t = useFormatMessage()
  const [dueDiligenceState, setDueDiligenceState] = useState(INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE)
  const isFormEdited = userModifiedForm(dueDiligenceState, INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE)
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedBudgetBreakdownConcept, setSelectedBudgetBreakdownConcept] =
    useState<BudgetBreakdownConceptType | null>(null)

  const handleSubmitItem = useCallback(
    (item: BudgetBreakdownConceptType) => {
      if (selectedBudgetBreakdownConcept) {
        setDueDiligenceState((prevState) => {
          const replaceEditedItem = (i: BudgetBreakdownConceptType) =>
            i.concept === selectedBudgetBreakdownConcept.concept ? item : i

          return {
            budgetBreakdown: prevState.budgetBreakdown.map(replaceEditedItem),
          }
        })
        setSelectedBudgetBreakdownConcept(null)
      } else {
        setDueDiligenceState((prevState) => ({ budgetBreakdown: [...prevState.budgetBreakdown, item] }))
      }
    },
    [selectedBudgetBreakdownConcept]
  )
  const fundingLeftToDisclose = useMemo(
    () => Number(funding) - Number(sumBy(dueDiligenceState.budgetBreakdown, 'estimatedBudget')),
    [dueDiligenceState.budgetBreakdown, funding]
  )

  const handleDeleteItem = useCallback(() => {
    if (selectedBudgetBreakdownConcept) {
      setDueDiligenceState((prevState) => ({
        budgetBreakdown: prevState.budgetBreakdown.filter((i) => i.concept !== selectedBudgetBreakdownConcept.concept),
      }))
      setModalOpen(false)
      setSelectedBudgetBreakdownConcept(null)
    }
  }, [selectedBudgetBreakdownConcept])

  const isCompleted = Number(funding) >= 0 && Number(fundingLeftToDisclose) <= 0

  useEffect(() => {
    onValidation(dueDiligenceState, isCompleted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueDiligenceState, isCompleted])

  return (
    <ProjectRequestSection
      shouldFocus={false}
      validated={isCompleted}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.due_diligence.title')}
      sectionNumber={sectionNumber}
    >
      <Label>{t('page.submit_grant.due_diligence.budget_breakdown_label')}</Label>
      <SubLabel isMarkdown>
        {t('page.submit_grant.due_diligence.budget_breakdown_detail', { value: fundingLeftToDisclose })}
      </SubLabel>
      {dueDiligenceState.budgetBreakdown.map((item, index) => (
        <BreakdownItem
          key={`${item.concept}-${index}`}
          title={item.concept}
          subtitle={t('page.proposal_view.grant.breakdown_subtitle', { duration: item.duration })}
          extra={Number(item.estimatedBudget).toLocaleString(undefined, CURRENCY_FORMAT_OPTIONS)}
          onClick={() => {
            setSelectedBudgetBreakdownConcept(item)
            setModalOpen(true)
          }}
        />
      ))}
      <AddBox disabled={isCompleted || isDisabled} onClick={() => setModalOpen(true)}>
        {isCompleted || Number(funding) <= 0
          ? t('page.submit_grant.due_diligence.budget_breakdown_no_funds_left')
          : t('page.submit_grant.due_diligence.budget_breakdown_add_concept')}
      </AddBox>
      <span className="ProjectRequestSection__ExampleLabel">
        {t('page.submit_grant.due_diligence.budget_breakdown_example')}
      </span>
      {isModalOpen && (
        <AddBudgetBreakdownModal
          isOpen={isModalOpen}
          onClose={() => {
            if (selectedBudgetBreakdownConcept) {
              setSelectedBudgetBreakdownConcept(null)
            }
            setModalOpen(false)
          }}
          onSubmit={handleSubmitItem}
          onDelete={handleDeleteItem}
          fundingLeftToDisclose={fundingLeftToDisclose}
          projectDuration={projectDuration}
          selectedConcept={selectedBudgetBreakdownConcept}
        />
      )}
    </ProjectRequestSection>
  )
}
