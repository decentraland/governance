import React, { useEffect, useMemo } from 'react'

import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { snakeCase } from 'lodash'

import { GrantTier } from '../../entities/Grant/GrantTier'
import {
  GRANT_PROPOSAL_MIN_BUDGET,
  GrantRequestFundingSchema,
  MIN_LOW_TIER_PROJECT_DURATION,
  NewGrantCategory,
} from '../../entities/Grant/types'
import { isValidGrantBudget } from '../../entities/Grant/utils'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import { getPercentage } from '../../helpers'
import useCategoryBudget from '../../hooks/useCategoryBudget'
import Helper from '../Helper/Helper'
import Lock from '../Icon/Lock'
import { ContentSection } from '../Layout/ContentLayout'

import DesiredFundingInput from './DesiredFundingInput'
import GrantRequestSection from './GrantRequestSection'
import { GrantRequestSectionCard } from './GrantRequestSectionCard'
import Label from './Label'
import ProjectDurationInput from './ProjectDurationInput'

const schema = GrantRequestFundingSchema
export type GrantRequestFunding = {
  funding: string | number
  projectDuration: number
}

export const INITIAL_GRANT_REQUEST_FUNDING_STATE: GrantRequestFunding = {
  funding: '',
  projectDuration: MIN_LOW_TIER_PROJECT_DURATION,
}

const AVAILABLE_CATEGORY_BUDGET = 100000 // TODO: Remove this

// TODO: this could be in a GrantCategory class/service/whatevs
const isValidBudgetForCategory = (budget: number | string | undefined, total: number) => {
  return !!budget && isValidGrantBudget(Number(budget)) && Number(budget) <= total
}

const validate = createValidator<GrantRequestFunding>({
  funding: (state) => ({
    funding:
      assert(Number.isFinite(asNumber(state.funding)), 'error.grant.funding.invalid') ||
      assert(!state.funding || asNumber(state.funding) >= schema.funding.minimum, 'error.grant.funding.too_low') ||
      assert(!state.funding || asNumber(state.funding) <= schema.funding.maximum, 'error.grant.funding.too_big') ||
      assert(
        !state.funding || (!!state.funding && state.funding <= AVAILABLE_CATEGORY_BUDGET), // TODO: This validation needs to be done dynamically
        'error.grant.funding.over_budget'
      ) ||
      undefined,
  }),
  projectDuration: (state) => ({
    projectDuration:
      assert(!state.projectDuration || Number.isFinite(asNumber(state.projectDuration)), 'error.grant.size_invalid') ||
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

function updateProjectDuration(rawFunding: string, previousDuration: number | undefined) {
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
}: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_GRANT_REQUEST_FUNDING_STATE)
  const isFormEdited = userModifiedForm(state.value, INITIAL_GRANT_REQUEST_FUNDING_STATE)

  useEffect(() => {
    onValidation({ ...state.value }, state.validated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  const availableDurations = useMemo(() => {
    return getProjectDurationOptions(Number(state.value.funding) || GRANT_PROPOSAL_MIN_BUDGET)
  }, [state.value.funding])

  const { totalCategoryBudget, availableCategoryBudget } = useCategoryBudget(grantCategory)

  const passThreshold =
    grantCategory && isValidBudgetForCategory(Number(state.value.funding), totalCategoryBudget)
      ? GrantTier.getVPThreshold(Number(state.value.funding))
      : undefined

  return (
    <GrantRequestSection
      onBlur={() => editor.validate()}
      validated={state.validated}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.funding_section.title')}
      sectionNumber={1}
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
                size="12"
                position="right center"
              />
            }
            title={`$${t('general.number', {
              value: availableCategoryBudget,
            })}`}
            titleExtra={`(${getPercentage(availableCategoryBudget, totalCategoryBudget, 0)})`}
            subtitle={t('page.submit_grant.funding_section.category_budget_total', {
              value: totalCategoryBudget,
            })}
            subtitleVariant="uppercase"
          />
        </div>
        <div className="GrantRequestSection__Row">
          <div className="GrantRequestSection__InputContainer">
            <DesiredFundingInput
              value={state.value.funding}
              onChange={({ currentTarget }) =>
                editor.set({
                  funding: currentTarget.value,
                  projectDuration: updateProjectDuration(currentTarget.value, state.value.projectDuration),
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
            helper={<Lock />}
            title={
              grantCategory && isValidBudgetForCategory(state.value.funding, totalCategoryBudget)
                ? t('page.submit_grant.funding_section.pass_threshold', { value: passThreshold })
                : null
            }
            subtitle={t('page.submit_grant.funding_section.pass_threshold_sub')}
          />
          <GrantRequestSectionCard
            category={t('page.submit_grant.funding_section.payout_strategy_title')}
            helper={<Lock />}
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
        <div className="GrantRequestSection__Row">
          <Label>{t('page.submit_grant.funding_section.funding_time_title')}</Label>
        </div>
      </ContentSection>
    </GrantRequestSection>
  )
}
