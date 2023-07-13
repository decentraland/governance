import React, { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import isEmail from 'validator/lib/isEmail'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { BidRequestFunding, BidRequestFundingSchema } from '../../entities/Bid/types'
import {
  GRANT_PROPOSAL_MAX_BUDGET,
  GRANT_PROPOSAL_MIN_BUDGET,
  MIN_LOW_TIER_PROJECT_DURATION,
} from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Field from '../Common/Form/Field'
import SubLabel from '../Common/SubLabel'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'
import PostLabel from '../PostLabel'
import BudgetInput from '../ProjectRequest/BudgetInput'
import NumberSelector from '../ProjectRequest/NumberSelector'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

const schema = BidRequestFundingSchema

export const INITIAL_BID_REQUEST_FUNDING_STATE: BidRequestFunding = {
  funding: '',
  projectDuration: MIN_LOW_TIER_PROJECT_DURATION,
  startDate: null,
  beneficiary: '',
  email: '',
}

interface Props {
  onValidation: (data: BidRequestFunding, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
}

export default function BidRequestFundingSection({ onValidation, isFormDisabled, sectionNumber }: Props) {
  const t = useFormatMessage()

  const {
    formState: { isDirty, isValid, errors },
    control,
    setValue,
    watch,
  } = useForm<BidRequestFunding>({
    defaultValues: INITIAL_BID_REQUEST_FUNDING_STATE,
    mode: 'onTouched',
  })

  const values = useWatch({ control }) as BidRequestFunding
  const isFormEdited = isDirty

  useEffect(() => {
    onValidation({ ...values }, isValid)
  }, [values, isValid, onValidation])

  return (
    <ProjectRequestSection
      validated={isValid}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_bid.funding_section.title')}
      sectionNumber={sectionNumber}
    >
      <ContentSection>
        <div className="ProjectRequestSection__Row">
          <div className="ProjectRequestSection__InputContainer">
            <Controller
              control={control}
              name="funding"
              rules={{
                required: { value: true, message: t('error.bid.funding.invalid') },
              }}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, ...field } }) => (
                <BudgetInput
                  label={t('page.submit_bid.funding_section.budget_label')}
                  min={schema.funding.minimum}
                  max={schema.funding.maximum}
                  placeholder={`${GRANT_PROPOSAL_MIN_BUDGET}-${GRANT_PROPOSAL_MAX_BUDGET}`}
                  error={errors.funding?.message || ''}
                  disabled={isFormDisabled}
                  {...field}
                />
              )}
            />
          </div>
          <div className="ProjectRequestSection__InputContainer">
            <NumberSelector
              value={watch('projectDuration')}
              min={schema.projectDuration.minimum}
              max={schema.projectDuration.maximum}
              onChange={(value) => setValue('projectDuration', Number(value))}
              label={t('page.submit_bid.funding_section.project_duration_label')}
              unitLabel={t('page.submit_bid.funding_section.project_duration_unit')}
            />
          </div>
        </div>
        <ContentSection className="ProjectRequestSection__Field">
          <Label>{t('page.submit_bid.funding_section.start_date_label')}</Label>
          <Field
            name="startDate"
            type="date"
            control={control}
            error={!!errors.startDate}
            message={errors.startDate?.message || ''}
            disabled={isFormDisabled}
            rules={{
              required: { value: true, message: t('error.bid.start_date_empty') },
            }}
            onChange={(_, { value }) => setValue('startDate', value)}
          />
        </ContentSection>
        <ContentSection className="ProjectRequestSection__Field">
          <Label>{t('page.submit_bid.general_info.beneficiary_label')}</Label>
          <SubLabel>{t('page.submit_bid.general_info.beneficiary_detail')}</SubLabel>
          <Field
            name="beneficiary"
            control={control}
            type="address"
            message={errors.beneficiary?.message}
            error={!!errors.beneficiary}
            disabled={isFormDisabled}
            rules={{
              required: { value: true, message: t('error.bid.general_info.beneficiary_empty') },
              validate: (value: string) => {
                if (!isEthereumAddress(value)) {
                  return t('error.bid.general_info.beneficiary_invalid')
                }
              },
            }}
          />
        </ContentSection>
        <ContentSection className="ProjectRequestSection__Field">
          <Label>{t('page.submit_bid.general_info.email_label')}</Label>
          <SubLabel>{t('page.submit_bid.general_info.email_detail')}</SubLabel>
          <Field
            name="email"
            control={control}
            type="email"
            placeholder={t('page.submit_bid.general_info.email_placeholder')}
            message={errors.email?.message}
            error={!!errors.email}
            disabled={isFormDisabled}
            rules={{
              required: { value: true, message: t('error.bid.general_info.email_empty') },
              validate: (value: string) => {
                if (!isEmail(value)) {
                  return t('error.bid.general_info.email_invalid')
                }
              },
            }}
          />
          <PostLabel>{t('page.submit_bid.general_info.email_note')}</PostLabel>
        </ContentSection>
      </ContentSection>
    </ProjectRequestSection>
  )
}
