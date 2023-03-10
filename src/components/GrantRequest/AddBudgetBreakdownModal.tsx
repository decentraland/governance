import React, { useEffect, useMemo } from 'react'

import Textarea from 'decentraland-gatsby/dist/components/Form/Textarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import isURL from 'validator/lib/isURL'

import { BudgetBreakdownConcept, BudgetBreakdownConceptSchema } from '../../entities/Grant/types'
import { asNumber } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import { ContentSection } from '../Layout/ContentLayout'

import AddModal from './AddModal'
import './AddModal.css'
import BudgetInput from './BudgetInput'
import NumberSelector from './NumberSelector'

export const INITIAL_BUDGET_BREAKDOWN_CONCEPT: BudgetBreakdownConcept = {
  concept: '',
  duration: 1,
  estimatedBudget: '',
  aboutThis: '',
  relevantLink: '',
}

const schema = BudgetBreakdownConceptSchema
const validate = (fundingLeftToDisclose: number) =>
  createValidator<BudgetBreakdownConcept>({
    concept: (state) => ({
      concept:
        assert(state.concept.length <= schema.concept.maxLength, 'error.grant.due_diligence.concept_too_large') ||
        assert(state.concept.length > 0, 'error.grant.due_diligence.concept_empty') ||
        assert(state.concept.length >= schema.concept.minLength, 'error.grant.due_diligence.concept_too_short') ||
        undefined,
    }),
    estimatedBudget: (state) => ({
      estimatedBudget:
        assert(
          Number.isInteger(asNumber(state.estimatedBudget)),
          'error.grant.due_diligence.estimated_budget_invalid'
        ) ||
        assert(
          !state.estimatedBudget || asNumber(state.estimatedBudget) >= schema.estimatedBudget.minimum,
          'error.grant.due_diligence.estimated_budget_too_low'
        ) ||
        assert(
          !state.estimatedBudget || asNumber(state.estimatedBudget) <= fundingLeftToDisclose,
          'error.grant.due_diligence.estimated_budget_too_big'
        ) ||
        undefined,
    }),
    aboutThis: (state) => ({
      aboutThis:
        assert(
          state.aboutThis.length <= schema.aboutThis.maxLength,
          'error.grant.due_diligence.about_this_too_large'
        ) ||
        assert(state.aboutThis.length > 0, 'error.grant.due_diligence.about_this_empty') ||
        assert(
          state.aboutThis.length >= schema.aboutThis.minLength,
          'error.grant.due_diligence.about_this_too_short'
        ) ||
        undefined,
    }),
  })

const edit = (state: BudgetBreakdownConcept, props: Partial<BudgetBreakdownConcept>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (item: BudgetBreakdownConcept) => void
  fundingLeftToDisclose: number
  projectDuration: number
}

const AddBudgetBreakdownModal = ({ isOpen, onClose, onSubmit, fundingLeftToDisclose, projectDuration }: Props) => {
  const t = useFormatMessage()
  const validator = useMemo(() => validate(fundingLeftToDisclose), [fundingLeftToDisclose])
  const [state, editor] = useEditor(edit, validator, INITIAL_BUDGET_BREAKDOWN_CONCEPT)

  const hasInvalidUrl =
    state.value.relevantLink !== '' &&
    !!state.value.relevantLink &&
    (!isURL(state.value.relevantLink) || state.value.relevantLink?.length >= schema.relevantLink.maxLength)

  useEffect(() => {
    if (state.validated) {
      onSubmit(state.value)
      onClose()
      editor.set(INITIAL_BUDGET_BREAKDOWN_CONCEPT)
    }
  }, [editor, onClose, onSubmit, state.validated, state.value])

  return (
    <AddModal
      title={t('page.submit_grant.due_diligence.budget_breakdown_modal.title')}
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryClick={() => !hasInvalidUrl && editor.validate()}
    >
      <div>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.due_diligence.budget_breakdown_modal.concept_label')}</Label>
          <Field
            value={state.value.concept}
            placeholder={t('page.submit_grant.due_diligence.budget_breakdown_modal.concept_placeholder')}
            onChange={(_, { value }) => editor.set({ concept: value })}
            error={!!state.error.concept}
            message={
              t(state.error.concept) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.concept.length,
                limit: schema.concept.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field GrantRequestSection__Field--row">
          <BudgetInput
            label={t('page.submit_grant.due_diligence.budget_breakdown_modal.estimated_budget_label')}
            value={state.value.estimatedBudget}
            error={state.error.estimatedBudget}
            onChange={({ currentTarget }) =>
              editor.set({
                estimatedBudget: currentTarget.value !== '' ? Number(currentTarget.value) : currentTarget.value,
              })
            }
            subtitle={t('page.submit_grant.due_diligence.budget_breakdown_modal.estimated_budget_left_to_disclose', {
              value: fundingLeftToDisclose,
            })}
          />
          <NumberSelector
            value={state.value.duration}
            min={BudgetBreakdownConceptSchema.duration.minimum}
            max={projectDuration}
            onChange={(value) => editor.set({ duration: Number(value) })}
            label={t('page.submit_grant.due_diligence.budget_breakdown_modal.duration_label')}
            unitLabel={t('page.submit_grant.due_diligence.budget_breakdown_modal.duration_unit_label')}
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.due_diligence.budget_breakdown_modal.about_this_label')}</Label>
          <Textarea
            value={state.value.aboutThis}
            minHeight={175}
            placeholder={t('page.submit_grant.due_diligence.budget_breakdown_modal.about_this_placeholder')}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ aboutThis: String(value) })}
            error={!!state.error.aboutThis}
            message={
              t(state.error.aboutThis) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.aboutThis.length,
                limit: schema.aboutThis.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.due_diligence.budget_breakdown_modal.relevant_link_label')}</Label>
          <Field
            value={state.value.relevantLink}
            placeholder={t('page.submit_grant.due_diligence.budget_breakdown_modal.relevant_link_placeholder')}
            onChange={(_, { value }) => editor.set({ relevantLink: value })}
            error={hasInvalidUrl}
            message={
              (!!state.value.relevantLink && !isURL(state.value.relevantLink)
                ? t('error.grant.due_diligence.relevant_link_invalid')
                : '') +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.relevantLink?.length,
                limit: schema.relevantLink.maxLength,
              })
            }
          />
        </ContentSection>
      </div>
    </AddModal>
  )
}

export default AddBudgetBreakdownModal
