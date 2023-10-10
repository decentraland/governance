import { useEffect } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import { BudgetBreakdownConcept, BudgetBreakdownConceptSchema } from '../../entities/Grant/types'
import { asNumber } from '../../entities/Proposal/utils'
import { isHttpsURL } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import Field from '../Common/Form/Field'
import TextArea from '../Common/Form/TextArea'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'
import BudgetInput from '../ProjectRequest/BudgetInput'
import NumberSelector from '../ProjectRequest/NumberSelector'

import AddModal from './AddModal'
import './AddModal.css'

const INITIAL_BUDGET_BREAKDOWN_CONCEPT: BudgetBreakdownConcept = {
  concept: '',
  duration: 1,
  estimatedBudget: '',
  aboutThis: '',
  relevantLink: '',
}

const schema = BudgetBreakdownConceptSchema

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (item: BudgetBreakdownConcept) => void
  onDelete: () => void
  fundingLeftToDisclose: number
  projectDuration: number
  selectedConcept: BudgetBreakdownConcept | null
}

export default function AddBudgetBreakdownModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  fundingLeftToDisclose,
  selectedConcept,
  projectDuration,
}: Props) {
  const t = useFormatMessage()
  const leftToDisclose = selectedConcept
    ? fundingLeftToDisclose + Number(selectedConcept.estimatedBudget)
    : fundingLeftToDisclose

  const {
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    register,
  } = useForm<BudgetBreakdownConcept>({
    defaultValues: INITIAL_BUDGET_BREAKDOWN_CONCEPT,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  const hasInvalidUrl =
    values.relevantLink !== '' &&
    !!values.relevantLink &&
    (!isHttpsURL(values.relevantLink) || values.relevantLink?.length >= schema.relevantLink.maxLength)

  const onSubmitForm: SubmitHandler<BudgetBreakdownConcept> = (data) => {
    if (hasInvalidUrl) {
      return
    }

    onSubmit(data)
    onClose()
    reset()
  }

  useEffect(() => {
    if (selectedConcept) {
      const { concept, aboutThis, duration, relevantLink } = selectedConcept
      setValue('concept', concept)
      setValue('aboutThis', aboutThis)
      setValue('duration', duration)
      setValue('relevantLink', relevantLink)
    }
  }, [selectedConcept, setValue])

  return (
    <AddModal
      title={t('page.submit_grant.due_diligence.budget_breakdown_modal.title')}
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryClick={handleSubmit(onSubmitForm)}
      onSecondaryClick={selectedConcept ? onDelete : undefined}
    >
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.due_diligence.budget_breakdown_modal.concept_label')}</Label>
        <Field
          name="concept"
          control={control}
          placeholder={t('page.submit_grant.due_diligence.budget_breakdown_modal.concept_placeholder')}
          error={!!errors.concept}
          message={
            (errors.concept?.message || '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('concept').length,
              limit: schema.concept.maxLength,
            })
          }
          rules={{
            required: { value: true, message: t('error.grant.due_diligence.concept_empty') },
            minLength: {
              value: schema.concept.minLength,
              message: t('error.grant.due_diligence.concept_too_short'),
            },
            maxLength: {
              value: schema.concept.maxLength,
              message: t('error.grant.due_diligence.concept_too_large'),
            },
          }}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__FieldRow">
        <BudgetInput
          {...register('estimatedBudget', {
            min: {
              value: schema.estimatedBudget.minimum,
              message: t('error.grant.due_diligence.estimated_budget_too_low'),
            },
            max: {
              value: leftToDisclose,
              message: t('error.grant.due_diligence.estimated_budget_too_big'),
            },
            validate: (value) => {
              if (!Number.isInteger(asNumber(value))) {
                return t('error.grant.due_diligence.estimated_budget_invalid')
              }
            },
          })}
          error={errors.estimatedBudget?.message}
          label={t('page.submit_grant.due_diligence.budget_breakdown_modal.estimated_budget_label')}
          min={0}
          defaultValue={selectedConcept ? selectedConcept.estimatedBudget : undefined}
          onChange={({ currentTarget }) =>
            setValue('estimatedBudget', currentTarget.value !== '' ? Number(currentTarget.value) : currentTarget.value)
          }
          subtitle={t('page.submit_grant.due_diligence.budget_breakdown_modal.estimated_budget_left_to_disclose', {
            value: leftToDisclose,
          })}
        />
        <NumberSelector
          value={Number(values.duration)}
          min={BudgetBreakdownConceptSchema.duration.minimum}
          max={projectDuration}
          onChange={(value) => setValue('duration', Number(value))}
          label={t('page.submit_grant.due_diligence.budget_breakdown_modal.duration_label')}
          subtitle={t('page.submit_grant.due_diligence.budget_breakdown_modal.duration_subtitle')}
          unit="months"
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <Label>{t('page.submit_grant.due_diligence.budget_breakdown_modal.about_this_label')}</Label>
        <TextArea
          name="aboutThis"
          control={control}
          placeholder={t('page.submit_grant.due_diligence.budget_breakdown_modal.about_this_placeholder')}
          error={errors.aboutThis?.message}
          message={t('page.submit.character_counter', {
            current: watch('aboutThis').length,
            limit: schema.aboutThis.maxLength,
          })}
          rules={{
            required: { value: true, message: t('error.grant.due_diligence.about_this_empty') },
            minLength: {
              value: schema.aboutThis.minLength,
              message: t('error.grant.due_diligence.about_this_too_short'),
            },
            maxLength: {
              value: schema.aboutThis.maxLength,
              message: t('error.grant.due_diligence.about_this_too_large'),
            },
          }}
        />
      </ContentSection>
      <ContentSection className="ProjectRequestSection__Field">
        <div className="LabelContainer">
          <Label>{t('page.submit_grant.due_diligence.budget_breakdown_modal.relevant_link_label')}</Label>
          <span className="Optional">{t('page.submit_grant.due_diligence.budget_breakdown_modal.optional_label')}</span>
        </div>
        <Field
          name="relevantLink"
          control={control}
          placeholder={t('page.submit_grant.due_diligence.budget_breakdown_modal.relevant_link_placeholder')}
          error={hasInvalidUrl}
          message={
            (hasInvalidUrl ? t('error.grant.due_diligence.relevant_link_invalid') : '') +
            ' ' +
            t('page.submit.character_counter', {
              current: watch('relevantLink') || ''.length,
              limit: schema.relevantLink.maxLength,
            })
          }
          rules={{
            maxLength: {
              value: schema.relevantLink.maxLength,
              message: t('error.grant.due_diligence.relevant_link_invalid'),
            },
            validate: (value: string) => {
              if (value && value !== '' && !isHttpsURL(value)) {
                return t('error.grant.due_diligence.relevant_link_invalid')
              }
            },
          }}
        />
      </ContentSection>
    </AddModal>
  )
}
