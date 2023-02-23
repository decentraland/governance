import React, { useEffect, useMemo } from 'react'

import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import { isEmpty } from 'lodash'
import snakeCase from 'lodash/snakeCase'

import { GrantTier } from '../../entities/Grant/GrantTier'
import {
  GRANT_PROPOSAL_MIN_BUDGET,
  GrantRequestFundingSchema,
  GrantTierType,
  MIN_LOW_TIER_PROJECT_DURATION,
  NewGrantCategory,
  PaymentToken,
  VestingStartDate,
} from '../../entities/Grant/types'
import { isValidGrantBudget } from '../../entities/Grant/utils'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import { getFormattedPercentage } from '../../helpers'
import useCategoryBudget from '../../hooks/useCategoryBudget'
import Helper from '../Helper/Helper'
import { ContentSection } from '../Layout/ContentLayout'

import CalculationHelper from './CalculationHelper'
import DesiredFundingInput from './DesiredFundingInput'
import './GrantRequestFundingSection.css'
import GrantRequestSection from './GrantRequestSection'
import { GrantRequestSectionCard } from './GrantRequestSectionCard'
import Label from './Label'
import ProjectDurationInput from './ProjectDurationInput'

const schema = GrantRequestFundingSchema
export type GrantRequestFunding = {
  funding: string | number
  projectDuration: number
  vestingStartDate: VestingStartDate
  paymentToken: PaymentToken
}

export const INITIAL_GRANT_REQUEST_FUNDING_STATE: GrantRequestFunding = {
  funding: '',
  projectDuration: MIN_LOW_TIER_PROJECT_DURATION,
  vestingStartDate: VestingStartDate.First,
  paymentToken: PaymentToken.MANA,
}

const isValidBudgetForCategory = (budget: number | string | undefined, total: number) => {
  return !!budget && isValidGrantBudget(Number(budget)) && Number(budget) <= total
}

const validate = (availableCategoryBudget: number | 0) =>
  createValidator<GrantRequestFunding>({
    funding: (state) => ({
      funding:
        assert(Number.isInteger(asNumber(state.funding)), 'error.grant.funding.invalid') ||
        assert(!state.funding || asNumber(state.funding) >= schema.funding.minimum, 'error.grant.funding.too_low') ||
        assert(!state.funding || asNumber(state.funding) <= schema.funding.maximum, 'error.grant.funding.too_big') ||
        assert(
          !state.funding || (!!state.funding && state.funding <= availableCategoryBudget),
          'error.grant.funding.over_budget'
        ) ||
        undefined,
    }),
    projectDuration: (state) => ({
      projectDuration:
        assert(
          !state.projectDuration || Number.isFinite(asNumber(state.projectDuration)),
          'error.grant.size_invalid'
        ) ||
        assert(
          !state.projectDuration || asNumber(state.projectDuration) >= schema.projectDuration.minimum,
          'error.grant.size_too_low'
        ) ||
        assert(
          !state.projectDuration || asNumber(state.projectDuration) <= schema.projectDuration.maximum,
          'error.grant.size_too_big'
        ) ||
        undefined,
    }),
  })

const edit = (state: GrantRequestFunding, props: Partial<GrantRequestFunding>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  grantCategory: NewGrantCategory | null
  onValidation: (data: GrantRequestFunding, sectionValid: boolean) => void
  onCategoryChange: () => void
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
  const validator = useMemo(() => validate(availableCategoryBudget), [availableCategoryBudget])
  const [state, editor] = useEditor(edit, validator, INITIAL_GRANT_REQUEST_FUNDING_STATE)
  const isFormEdited = userModifiedForm(state.value, INITIAL_GRANT_REQUEST_FUNDING_STATE)

  useEffect(() => {
    isFormEdited && editor.validate()
    onValidation({ ...state.value }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  const availableDurations = useMemo(() => {
    return getProjectDurationOptions(Number(state.value.funding) || GRANT_PROPOSAL_MIN_BUDGET)
  }, [state.value.funding])

  const passThreshold =
    grantCategory && isValidBudgetForCategory(Number(state.value.funding), totalCategoryBudget)
      ? GrantTier.getVPThreshold(Number(state.value.funding))
      : undefined

  const isHigherTier = isValidGrantBudget(Number(state.value.funding))
    ? GrantTier.getTypeFromBudget(Number(state.value.funding)) === GrantTierType.HigherTier
    : false

  useEffect(() => {
    if (isHigherTier) {
      editor.set({ paymentToken: PaymentToken.DAI })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value.funding])

  return (
    <GrantRequestSection
      onBlur={() => {
        if (state.value.funding !== '') {
          editor.validate()
        }
      }}
      validated={state.validated || (isFormEdited && isEmpty(state.error))}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.funding_section.title')}
      sectionNumber={sectionNumber}
    >
      <ContentSection className="GrantRequestSection__Content">
        <div className="GrantRequestSection__Row">
          {grantCategory && (
            <GrantRequestSectionCard
              category={t('page.submit_grant.funding_section.project_category_title')}
              helper={
                <Button basic onClick={onCategoryChange}>
                  {t('page.submit_grant.funding_section.project_category_action')}
                </Button>
              }
              title={grantCategory}
              subtitle={t(`page.submit_grant.${snakeCase(grantCategory || undefined)}_description`)}
            />
          )}
          <GrantRequestSectionCard
            category={t('page.submit_grant.funding_section.category_budget_title')}
            helper={
              <Helper
                text={t('page.submit_grant.funding_section.category_budget_info')}
                size="16"
                position="right center"
              />
            }
            title={`$${t('general.number', {
              value: availableCategoryBudget,
            })}`}
            titleExtra={`(${getFormattedPercentage(availableCategoryBudget, totalCategoryBudget, 0)})`}
            subtitle={t('page.submit_grant.funding_section.category_budget_total', {
              value: totalCategoryBudget,
            })}
            subtitleVariant="uppercase"
            error={state.error.funding === 'error.grant.funding.over_budget'}
          />
        </div>
        <div className="GrantRequestSection__Row">
          <div className="GrantRequestSection__InputContainer">
            <DesiredFundingInput
              value={state.value.funding}
              onChange={({ currentTarget }) =>
                editor.set({
                  funding: currentTarget.value,
                  projectDuration: getUpdatedProjectDuration(currentTarget.value, state.value.projectDuration),
                })
              }
              onBlur={() => editor.set({ funding: state.value.funding })}
              error={state.error.funding || ''}
              disabled={isFormDisabled}
            />
          </div>
          <div className="GrantRequestSection__InputContainer">
            <ProjectDurationInput
              value={state.value.projectDuration}
              options={availableDurations}
              onChange={(value) => editor.set({ projectDuration: Number(value) })}
            />
          </div>
        </div>
        <div className="GrantRequestSection__Row">
          <GrantRequestSectionCard
            category={t('page.submit_grant.funding_section.pass_threshold_title')}
            helper={<CalculationHelper />}
            title={
              grantCategory && isValidBudgetForCategory(state.value.funding, totalCategoryBudget)
                ? t('page.submit_grant.funding_section.pass_threshold', { value: passThreshold })
                : null
            }
            subtitle={t('page.submit_grant.funding_section.pass_threshold_sub')}
          />
          <GrantRequestSectionCard
            category={t('page.submit_grant.funding_section.payout_strategy_title')}
            helper={<CalculationHelper />}
            title={
              grantCategory && isValidBudgetForCategory(state.value.funding, totalCategoryBudget)
                ? t('page.submit_grant.funding_section.payout_strategy_payments', {
                    value: state.value.projectDuration,
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
            onClick={() => editor.set({ vestingStartDate: VestingStartDate.First })}
          >
            <Radio
              name="vestingStartDate"
              id={VestingStartDate.First}
              value={VestingStartDate.First}
              checked={state.value.vestingStartDate === VestingStartDate.First}
              type="radio"
              disabled={isFormDisabled}
            />
            {t('page.submit_grant.funding_section.funding_time_first_day')}
          </ContentSection>
          <ContentSection
            className="GrantRequestFundingSection__Radio"
            onClick={() => editor.set({ vestingStartDate: VestingStartDate.Fifteenth })}
          >
            <Radio
              name="vestingStartDate"
              id={VestingStartDate.Fifteenth}
              value={VestingStartDate.Fifteenth}
              type="radio"
              checked={state.value.vestingStartDate === VestingStartDate.Fifteenth}
              disabled={isFormDisabled}
            />
            {t('page.submit_grant.funding_section.funding_time_fifteenth_day')}
          </ContentSection>
        </div>
        <div>
          <Label>{t('page.submit_grant.funding_section.preferred_payment_token')}</Label>
          <ContentSection
            className="GrantRequestFundingSection__Radio"
            onClick={() => !isHigherTier && editor.set({ paymentToken: PaymentToken.MANA })}
          >
            <Radio
              name="paymentToken"
              id={PaymentToken.MANA}
              value={PaymentToken.MANA}
              checked={state.value.paymentToken === PaymentToken.MANA}
              type="radio"
              disabled={isHigherTier || isFormDisabled}
            />
            {t('page.submit_grant.funding_section.preferred_payment_token_mana')}
          </ContentSection>
          <ContentSection
            className="GrantRequestFundingSection__Radio"
            onClick={() => !isHigherTier && editor.set({ paymentToken: PaymentToken.DAI })}
          >
            <Radio
              name="paymentToken"
              id={PaymentToken.DAI}
              value={PaymentToken.DAI}
              type="radio"
              checked={state.value.paymentToken === PaymentToken.DAI}
              disabled={isHigherTier || isFormDisabled}
            />
            {t('page.submit_grant.funding_section.preferred_payment_token_dai')}
          </ContentSection>
        </div>
      </ContentSection>
    </GrantRequestSection>
  )
}
