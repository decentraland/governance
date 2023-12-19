import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { GeneralUpdate, GeneralUpdateSchema, ProjectHealth } from '../../entities/Updates/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Label from '../Common/Typography/Label'
import MarkdownField from '../Form/MarkdownFieldSection'
import { ContentSection } from '../Layout/ContentLayout'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import ProjectHealthButton from './ProjectHealthButton'

interface Props {
  onValidation: (data: GeneralUpdate, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
  intialValues?: Partial<GeneralUpdate>
}

const UPDATE_GENERAL_INITIAL_STATE: GeneralUpdate = {
  health: ProjectHealth.OnTrack,
  introduction: '',
  highlights: '',
  blockers: '',
  next_steps: '',
  additional_notes: '',
}

const schema = GeneralUpdateSchema

function GeneralSection({ onValidation, isFormDisabled, sectionNumber, intialValues }: Props) {
  const t = useFormatMessage()
  const {
    formState: { isValid, errors, isDirty },
    control,
    setValue,
    watch,
  } = useForm<GeneralUpdate>({
    defaultValues: intialValues || UPDATE_GENERAL_INITIAL_STATE,
    mode: 'onTouched',
  })

  const values = useWatch({ control })

  const handleHealthChange = (health: ProjectHealth) => setValue('health', health)
  const health = watch('health')

  const getFieldProps = (fieldName: keyof GeneralUpdate, isRequired = true) => ({
    control,
    name: fieldName,
    error: !!errors[fieldName],
    rules: {
      ...(isRequired && {
        required: { value: true, message: t(`error.proposal_update.${fieldName}_empty`) },
      }),
      minLength: {
        value: schema[fieldName].minLength,
        message: t(`error.proposal_update.${fieldName}_too_short`),
      },
      maxLength: {
        value: schema[fieldName].maxLength,
        message: t(`error.proposal_update.${fieldName}_too_large`),
      },
    },
    message:
      t(errors[fieldName]?.message || '') +
      ' ' +
      t('page.submit.character_counter', {
        current: watch(fieldName)?.length || 0,
        limit: schema[fieldName].maxLength,
      }),
  })

  useEffect(() => {
    onValidation({ ...(values as GeneralUpdate) }, isValid)
  }, [values, isValid, onValidation])
  return (
    <ProjectRequestSection
      validated={isValid}
      isFormEdited={isDirty}
      sectionTitle={t('page.proposal_update.general_section_title')}
      sectionNumber={sectionNumber}
    >
      <ContentSection>
        <Label>{t('page.proposal_update.health_label')}</Label>
        <div className="UpdateSubmit__ProjectHealthContainer">
          <ProjectHealthButton
            type={ProjectHealth.OnTrack}
            selectedValue={health}
            onClick={handleHealthChange}
            disabled={isFormDisabled}
          >
            {t('page.proposal_update.on_track_label') || ''}
          </ProjectHealthButton>
          <ProjectHealthButton
            type={ProjectHealth.AtRisk}
            selectedValue={health}
            onClick={handleHealthChange}
            disabled={isFormDisabled}
          >
            {t('page.proposal_update.at_risk_label') || ''}
          </ProjectHealthButton>
          <ProjectHealthButton
            type={ProjectHealth.OffTrack}
            selectedValue={health}
            onClick={handleHealthChange}
            disabled={isFormDisabled}
          >
            {t('page.proposal_update.off_track_label') || ''}
          </ProjectHealthButton>
        </div>
      </ContentSection>
      <MarkdownField
        showMarkdownNotice={false}
        label={t('page.proposal_update.introduction_label')}
        disabled={isFormDisabled}
        minHeight={77}
        {...getFieldProps('introduction')}
      />
      <MarkdownField
        showMarkdownNotice={false}
        label={t('page.proposal_update.highlights_label')}
        placeholder={t('page.proposal_update.highlights_placeholder')}
        disabled={isFormDisabled}
        {...getFieldProps('highlights')}
      />
      <MarkdownField
        showMarkdownNotice={false}
        label={t('page.proposal_update.blockers_label')}
        placeholder={t('page.proposal_update.blockers_placeholder')}
        disabled={isFormDisabled}
        {...getFieldProps('blockers')}
      />
      <MarkdownField
        showMarkdownNotice={false}
        label={t('page.proposal_update.next_steps_label')}
        placeholder={t('page.proposal_update.next_steps_placeholder')}
        disabled={isFormDisabled}
        {...getFieldProps('next_steps')}
      />
      <MarkdownField
        showMarkdownNotice={false}
        label={t('page.proposal_update.additional_notes_label')}
        placeholder={t('page.proposal_update.additional_notes_placeholder')}
        disabled={isFormDisabled}
        {...getFieldProps('additional_notes', false)}
      />
    </ProjectRequestSection>
  )
}

export default GeneralSection
