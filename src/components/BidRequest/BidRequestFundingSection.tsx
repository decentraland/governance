import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Field as DCLField } from 'decentraland-ui/dist/components/Field/Field'
import isEmail from 'validator/lib/isEmail'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { BID_MIN_PROJECT_DURATION } from '../../entities/Bid/constants'
import { BidRequestFunding, BidRequestFundingSchema } from '../../entities/Bid/types'
import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import Field from '../Common/Form/Field'
import SubLabel from '../Common/SubLabel'
import Label from '../Common/Typography/Label'
import { ContentSection } from '../Layout/ContentLayout'
import PostLabel from '../PostLabel'
import BudgetInput from '../ProjectRequest/BudgetInput'
import NumberSelector from '../ProjectRequest/NumberSelector'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

const schema = BidRequestFundingSchema

export const INITIAL_BID_REQUEST_FUNDING_STATE: Partial<BidRequestFunding> = {
  funding: '',
  projectDuration: BID_MIN_PROJECT_DURATION,
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
    setError,
    clearErrors,
  } = useForm<BidRequestFunding>({
    defaultValues: INITIAL_BID_REQUEST_FUNDING_STATE,
    mode: 'onTouched',
  })

  const values = useWatch({ control }) as BidRequestFunding

  useEffect(() => {
    onValidation({ ...values }, isValid)
  }, [values, isValid, onValidation])

  return (
    <ProjectRequestSection
      validated={isValid}
      isFormEdited={isDirty}
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
                min: { value: schema.funding.minimum, message: t('error.bid.funding.too_low') },
                max: { value: schema.funding.maximum, message: t('error.bid.funding.too_big') },
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
              unit="months"
            />
          </div>
        </div>
        <div className="ProjectRequestSection__Row">
          <ContentSection className="ProjectRequestSection__Field">
            <Label>{t('page.submit_bid.funding_section.delivery_date_label')}</Label>
            <DCLField
              name="deliveryDate"
              type="date"
              control={control}
              error={!!errors.deliveryDate}
              message={errors.deliveryDate?.message || ''}
              disabled={isFormDisabled}
              onChange={(_, { value }) => {
                clearErrors('deliveryDate')
                if (value === '') {
                  setError('deliveryDate', { message: t('error.bid.delivery_date_empty') })
                }
                if (Time(value).isBefore(Time())) {
                  setError('deliveryDate', { message: t('error.bid.delivery_date_future') })
                }
                setValue('deliveryDate', value)
              }}
            />
          </ContentSection>
        </div>
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
              validate: (value?: string) => {
                if (!value || !isEthereumAddress(value)) {
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
