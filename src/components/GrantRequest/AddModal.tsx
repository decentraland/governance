import React, { useEffect } from 'react'

import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { TextAreaField } from 'decentraland-ui/dist/components/TextAreaField/TextAreaField'

import {
  GRANT_PROPOSAL_MAX_BUDGET,
  GRANT_PROPOSAL_MIN_BUDGET, // MAX_PROJECT_DURATION,
  // MIN_PROJECT_DURATION,
} from '../../entities/Grant/types'
import { asNumber } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import { ContentSection } from '../Layout/ContentLayout'

import './AddModal.css'
import BudgetInput from './BudgetInput'
import { BudgetBreakdownItem } from './GrantRequestDueDilligenceSection'

const BudgetBreakdownItemSchema = {
  concept: {
    type: 'string',
    minLength: 1,
    maxLength: 80,
  },
  // duration: {
  //   type: 'integer',
  //   minimum: Number(MIN_PROJECT_DURATION || 1),
  //   maximum: Number(MAX_PROJECT_DURATION || 1),
  // },
  estimatedBudget: {
    type: 'integer',
    minimum: Number(GRANT_PROPOSAL_MIN_BUDGET || 0),
    maximum: Number(GRANT_PROPOSAL_MAX_BUDGET || 0),
  },
  aboutThis: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  relevantLink: {
    type: 'string',
    minLength: 1,
    maxLength: 80,
  },
}

export const INITIAL_BUDGET_BREAKDOWN_ITEM: BudgetBreakdownItem = {
  concept: '',
  // duration: 0,
  estimatedBudget: '',
  aboutThis: '',
  relevantLink: '',
}

const schema = BudgetBreakdownItemSchema
const validate = createValidator<BudgetBreakdownItem>({
  concept: (state) => ({
    concept:
      assert(state.concept.length <= schema.concept.maxLength, 'error.grant.due_dilligence.concept_too_large') ||
      assert(state.concept.length > 0, 'error.grant.due_dilligence.concept_empty') ||
      assert(state.concept.length >= schema.concept.minLength, 'error.grant.due_dilligence.concept_too_short') ||
      undefined,
  }),
  estimatedBudget: (state) => ({
    estimatedBudget:
      assert(
        Number.isInteger(asNumber(state.estimatedBudget)),
        'error.grant.due_dilligence.estimated_budget_invalid'
      ) ||
      assert(
        !state.estimatedBudget || asNumber(state.estimatedBudget) >= schema.estimatedBudget.minimum,
        'error.grant.due_dilligence.estimated_budget_too_low'
      ) ||
      assert(
        !state.estimatedBudget || asNumber(state.estimatedBudget) <= schema.estimatedBudget.maximum,
        'error.grant.due_dilligence.estimated_budget_too_big'
      ) ||
      undefined,
  }),
  aboutThis: (state) => ({
    aboutThis:
      assert(state.aboutThis.length <= schema.aboutThis.maxLength, 'error.grant.due_dilligence.about_this_too_large') ||
      assert(state.aboutThis.length > 0, 'error.grant.due_dilligence.about_this_empty') ||
      assert(state.aboutThis.length >= schema.aboutThis.minLength, 'error.grant.due_dilligence.about_this_too_short') ||
      undefined,
  }),
  relevantLink: (state) => ({
    relevantLink:
      assert(
        !!state.relevantLink && state.relevantLink.length <= schema.relevantLink.maxLength,
        'error.grant.due_dilligence.relevant_link_too_large'
      ) ||
      assert(!!state.relevantLink && state.relevantLink.length > 0, 'error.grant.due_dilligence.relevant_link_empty') ||
      assert(
        !!state.relevantLink && state.relevantLink.length >= schema.relevantLink.minLength,
        'error.grant.due_dilligence.relevant_link_too_short'
      ) ||
      undefined,
  }),
})

const edit = (state: BudgetBreakdownItem, props: Partial<BudgetBreakdownItem>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (item: BudgetBreakdownItem) => void
}

const AddModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_BUDGET_BREAKDOWN_ITEM)

  useEffect(() => {
    if (state.validated) {
      onSubmit(state.value)
      onClose()
      editor.set(INITIAL_BUDGET_BREAKDOWN_ITEM)
    }
  }, [editor, onClose, onSubmit, state.validated, state.value])

  return (
    <Modal
      onClose={onClose}
      size="small"
      closeIcon={<Close />}
      className="GovernanceContentModal AddModal"
      open={isOpen}
    >
      <Modal.Header className="AddModal__Title">
        {t('page.submit_grant.due_dilligence.budget_breakdown_modal.title')}
      </Modal.Header>
      <Modal.Content>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.due_dilligence.budget_breakdown_modal.concept_label')}</Label>
          <Field
            value={state.value.concept}
            placeholder={t('page.submit_grant.due_dilligence.budget_breakdown_modal.concept_placeholder')}
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
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.due_dilligence.budget_breakdown_modal.estimated_budget_label')}</Label>
          <BudgetInput
            value={state.value.estimatedBudget}
            error={state.error.estimatedBudget}
            onChange={({ currentTarget }) =>
              editor.set({
                estimatedBudget: currentTarget.value,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.due_dilligence.budget_breakdown_modal.about_this_label')}</Label>
          <TextAreaField
            minHeight={175}
            value={state.value.aboutThis}
            placeholder={t('page.submit_grant.due_dilligence.budget_breakdown_modal.about_this_placeholder')}
            onChange={(_, { value }) => editor.set({ aboutThis: String(value) })}
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
          <Label>{t('page.submit_grant.due_dilligence.budget_breakdown_modal.relevant_link_label')}</Label>
          <Field
            value={state.value.relevantLink}
            placeholder={t('page.submit_grant.due_dilligence.budget_breakdown_modal.relevant_link_placeholder')}
            onChange={(_, { value }) => editor.set({ relevantLink: value })}
            error={!!state.error.relevantLink}
            message={
              t(state.error.relevantLink) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.relevantLink?.length,
                limit: schema.relevantLink.maxLength,
              })
            }
          />
        </ContentSection>
        <div>
          <Button fluid primary onClick={() => editor.validate()}>
            {t('page.submit_grant.modal_actions.submit')}
          </Button>
          <Button fluid secondary onClick={onClose} className="AddModal__SecondaryButton">
            {t('page.submit_grant.modal_actions.cancel')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default AddModal
