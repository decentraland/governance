import React, { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import snakeCase from 'lodash/snakeCase'

import { GrantTier } from '../../entities/Grant/GrantTier'
import {
  GRANT_PROPOSAL_MAX_BUDGET,
  GRANT_PROPOSAL_MIN_BUDGET,
  GrantRequestFunding,
  GrantRequestFundingSchema,
  GrantTierType,
  MIN_LOW_TIER_PROJECT_DURATION,
  NewGrantCategory,
  PaymentToken,
  VestingStartDate,
} from '../../entities/Grant/types'
import { isValidGrantBudget } from '../../entities/Grant/utils'
import { getFormattedPercentage } from '../../helpers'
import useCategoryBudget from '../../hooks/useCategoryBudget'
import Label from '../Common/Label'
import Helper from '../Helper/Helper'
import { ContentSection } from '../Layout/ContentLayout'

import BudgetInput from './BudgetInput'
import CalculationHelper from './CalculationHelper'
import './GrantRequestFundingSection.css'
import GrantRequestSection from './GrantRequestSection'
import { GrantRequestSectionCard } from './GrantRequestSectionCard'
import NumberSelector from './NumberSelector'

const schema = GrantRequestFundingSchema

export const INITIAL_GRANT_REQUEST_FUNDING_STATE: GrantRequestFunding = {
  funding: '',
  projectDuration: MIN_LOW_TIER_PROJECT_DURATION,
  vestingStartDate: VestingStartDate.First,
  paymentToken: PaymentToken.MANA,
}

const isValidBudgetForCategory = (budget: number | string | undefined, total: number) => {
  return !!budget && isValidGrantBudget(Number(budget)) && Number(budget) <= total
}

interface Props {
  grantCategory: NewGrantCategory | null
  onValidation: (data: GrantRequestFunding, sectionValid: boolean) => void
  onCategoryChange: (category: NewGrantCategory) => void
  isFormDisabled: boolean
  sectionNumber: number
}

function getAvailableProjectDurations(rawFunding: number | string | undefined) {
  const funding = isValidGrantBudget(Number(rawFunding)) ? Number(rawFunding) : GRANT_PROPOSAL_MIN_BUDGET
  const { min, max } = GrantTier.getProjectDurationsLimits(funding)

  const availableDurations = []
  for (let i = min; i <= max; i++) {
    availableDurations.push(i)
  }
  return availableDurations
}

function getProjectDurationOptions(funding: number) {
  const projectDurationOptions = []
  const availableDurations = getAvailableProjectDurations(funding)
  for (const i in availableDurations) {
    const duration = availableDurations[i]
    projectDurationOptions.push(duration)
  }
  return projectDurationOptions
}

function getUpdatedProjectDuration(rawFunding: string, previousDuration: number | undefined) {
  const availableDurations = getAvailableProjectDurations(rawFunding)
  const previousDurationIsBetweenNewLimits =
    previousDuration &&
    previousDuration > availableDurations[0] &&
    previousDuration < availableDurations[availableDurations.length - 1]
  return previousDurationIsBetweenNewLimits ? previousDuration : availableDurations[0]
}

export default function GrantRequestFundingSection({
  onValidation,
  isFormDisabled,
  grantCategory,
  onCategoryChange,
  sectionNumber,
}: Props) {
  const t = useFormatMessage()
  const { totalCategoryBudget, availableCategoryBudget } = useCategoryBudget(grantCategory)

  const {
    formState: { isDirty, isValid, errors },
    control,
    setValue,
    watch,
  } = useForm<GrantRequestFunding>({
    defaultValues: INITIAL_GRANT_REQUEST_FUNDING_STATE,
    mode: 'onTouched',
  })

  const isFormEdited = isDirty

  const values = useMemo(() => watch(), [watch])

  useEffect(() => {
    onValidation({ ...values }, isValid)
  }, [values, isValid, onValidation])

  const funding = watch('funding')

  const availableDurations = useMemo(() => {
    return getProjectDurationOptions(Number(funding) || GRANT_PROPOSAL_MIN_BUDGET)
  }, [funding])

  const passThreshold =
    grantCategory && isValidBudgetForCategory(Number(funding), totalCategoryBudget)
      ? GrantTier.getVPThreshold(Number(funding))
      : undefined

  const isHigherTier = isValidGrantBudget(Number(funding))
    ? GrantTier.getTypeFromBudget(Number(funding)) === GrantTierType.HigherTier
    : false

  useEffect(() => {
    if (isHigherTier) {
      setValue('paymentToken', PaymentToken.DAI)
    }
  }, [isHigherTier, setValue])

  useEffect(() => {
    setValue('projectDuration', getUpdatedProjectDuration(String(funding), watch('projectDuration')))
  }, [setValue, funding, watch])

  return (
    <GrantRequestSection
      validated={isValid}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.funding_section.title')}
      sectionNumber={sectionNumber}
    >
      <ContentSection className="GrantRequestSection__Content">
        <div className="GrantRequestSection__Row">
          {grantCategory && (
            <GrantRequestSectionCard
              title={t('page.submit_grant.funding_section.project_category_title')}
              helper={
                <Button basic onClick={() => onCategoryChange(grantCategory)}>
                  {t('page.submit_grant.funding_section.project_category_action')}
                </Button>
              }
              content={grantCategory}
              subtitle={t(`page.submit_grant.${snakeCase(grantCategory || undefined)}_description`)}
            />
          )}
          <GrantRequestSectionCard
            title={t('page.submit_grant.funding_section.category_budget_title')}
            helper={
              <Helper
                text={t('page.submit_grant.funding_section.category_budget_info')}
                size="16"
                position="right center"
              />
            }
            content={`$${t('general.number', {
              value: availableCategoryBudget,
            })}`}
            titleExtra={`(${getFormattedPercentage(availableCategoryBudget, totalCategoryBudget, 0)})`}
            subtitle={t('page.submit_grant.funding_section.category_budget_total', {
              value: totalCategoryBudget,
            })}
            subtitleVariant="uppercase"
            error={errors.funding?.message === 'error.grant.funding.over_budget'}
          />
        </div>
        <div className="GrantRequestSection__Row">
          <div className="GrantRequestSection__InputContainer">
            <Controller
              control={control}
              name="funding"
              rules={{
                required: { value: true, message: t('error.grant.funding.invalid') },
                validate: (value) => {
                  if (value > availableCategoryBudget) {
                    return t('error.grant.funding.over_budget')
                  }
                },
                min: { value: schema.funding.minimum, message: t('error.grant.funding.too_low') },
                max: { value: schema.funding.maximum, message: t('error.grant.funding.too_big') },
              }}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, ...field } }) => (
                <BudgetInput
                  label={t('page.submit_grant.funding_section.desired_funding')}
                  min={GRANT_PROPOSAL_MIN_BUDGET}
                  max={GRANT_PROPOSAL_MAX_BUDGET}
                  placeholder={`${GRANT_PROPOSAL_MIN_BUDGET}-${GRANT_PROPOSAL_MAX_BUDGET}`}
                  subtitle={t('page.submit_grant.funding_section.desired_funding_sub')}
                  error={errors.funding?.message || ''}
                  disabled={isFormDisabled}
                  {...field}
                />
              )}
            />
          </div>
          <div className="GrantRequestSection__InputContainer">
            <NumberSelector
              value={watch('projectDuration')}
              min={availableDurations[0]}
              max={availableDurations[availableDurations.length - 1]}
              onChange={(value) => setValue('projectDuration', Number(value))}
              label={t('page.submit_grant.funding_section.project_duration_title')}
              unitLabel={t('page.submit_grant.funding_section.project_duration_unit')}
            />
          </div>
        </div>
        <div className="GrantRequestSection__Row">
          <GrantRequestSectionCard
            title={t('page.submit_grant.funding_section.pass_threshold_title')}
            helper={<CalculationHelper />}
            content={
              grantCategory && isValidBudgetForCategory(watch('funding'), totalCategoryBudget)
                ? t('page.submit_grant.funding_section.pass_threshold', { value: passThreshold })
                : null
            }
            subtitle={t('page.submit_grant.funding_section.pass_threshold_sub')}
          />
          <GrantRequestSectionCard
            title={t('page.submit_grant.funding_section.payout_strategy_title')}
            helper={<CalculationHelper />}
            content={
              grantCategory && isValidBudgetForCategory(watch('funding'), totalCategoryBudget)
                ? t('page.submit_grant.funding_section.payout_strategy_payments', {
                    value: watch('projectDuration'),
                  })
                : null
            }
            subtitle={t('page.submit_grant.funding_section.payout_strategy_sub')}
          />
        </div>
        <div className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.funding_section.funding_time_title')}</Label>
          <ContentSection
            className="GrantRequestFundingSection__Radio"
            onClick={() => setValue('vestingStartDate', VestingStartDate.First)}
          >
            <Radio
              name="vestingStartDate"
              id={VestingStartDate.First}
              value={VestingStartDate.First}
              checked={watch('vestingStartDate') === VestingStartDate.First}
              type="radio"
              disabled={isFormDisabled}
            />
            {t('page.submit_grant.funding_section.funding_time_first_day')}
          </ContentSection>
          <ContentSection
            className="GrantRequestFundingSection__Radio"
            onClick={() => setValue('vestingStartDate', VestingStartDate.Fifteenth)}
          >
            <Radio
              name="vestingStartDate"
              id={VestingStartDate.Fifteenth}
              value={VestingStartDate.Fifteenth}
              type="radio"
              checked={watch('vestingStartDate') === VestingStartDate.Fifteenth}
              disabled={isFormDisabled}
            />
            {t('page.submit_grant.funding_section.funding_time_fifteenth_day')}
          </ContentSection>
        </div>
        <div>
          <Label>{t('page.submit_grant.funding_section.preferred_payment_token')}</Label>
          <ContentSection
            className="GrantRequestFundingSection__Radio"
            onClick={() => !isHigherTier && setValue('paymentToken', PaymentToken.MANA)}
          >
            <Radio
              name="paymentToken"
              id={PaymentToken.MANA}
              value={PaymentToken.MANA}
              checked={watch('paymentToken') === PaymentToken.MANA}
              type="radio"
              disabled={isHigherTier || isFormDisabled}
            />
            {t('page.submit_grant.funding_section.preferred_payment_token_mana')}
          </ContentSection>
          <ContentSection
            className="GrantRequestFundingSection__Radio"
            onClick={() => !isHigherTier && setValue('paymentToken', PaymentToken.DAI)}
          >
            <Radio
              name="paymentToken"
              id={PaymentToken.DAI}
              value={PaymentToken.DAI}
              type="radio"
              checked={watch('paymentToken') === PaymentToken.DAI}
              disabled={isHigherTier || isFormDisabled}
            />
            {t('page.submit_grant.funding_section.preferred_payment_token_dai')}
          </ContentSection>
        </div>
      </ContentSection>
    </GrantRequestSection>
  )
}
