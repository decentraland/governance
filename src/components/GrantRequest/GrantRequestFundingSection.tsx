import React, { useEffect, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { GrantTier } from '../../entities/Grant/GrantTier'
import { isValidGrantBudget } from '../../entities/Grant/utils'
import { ProposalGrantCategory } from '../../entities/Proposal/types'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import { getPercentage } from '../../helpers'
import Helper from '../Helper/Helper'
import InWorldContent from '../Icon/Grants/InWorldContent'
import Lock from '../Icon/Lock'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestFundingSchema } from './GrantRequestSchema'
import GrantRequestSection from './GrantRequestSection'


const schema = GrantRequestFundingSchema
export type GrantRequestFundingState = {
  funding: string | number
  projectDuration: number
  category: ProposalGrantCategory | null
}

export const INITIAL_GRANT_REQUEST_FUNDING_STATE: GrantRequestFundingState = {
  funding: String(schema.funding),
  projectDuration: 0,
  category: null,
}
const QUARTERLY_TOTAL_FOR_CATEGORY = 2500000
const AVAILABLE_CATEGORY_BUDGET = 100000

const isValidBudgetForCategory = (budget: number | string | undefined) => {
  return !!budget && isValidGrantBudget(Number(budget)) && Number(budget) <= AVAILABLE_CATEGORY_BUDGET
}

const validate = createValidator<GrantRequestFundingState>({
  funding: (state) => ({
    funding:
      assert(!state.funding || Number.isFinite(asNumber(state.funding)), 'error.grant.funding.invalid') ||
      assert(!state.funding || asNumber(state.funding) >= schema.funding.minimum, 'error.grant.funding.too_low') ||
      assert(!state.funding || asNumber(state.funding) <= schema.funding.maximum, 'error.grant.funding.too_big') ||
      assert(
        !state.funding || (!!state.funding && state.funding <= AVAILABLE_CATEGORY_BUDGET),
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

const edit = (state: GrantRequestFundingState, props: Partial<GrantRequestFundingState>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  onValidation: (data: GrantRequestFundingState) => void
}

function getAvailableProjectDurations(funding: number) {
  const min = funding > 20000 ? 3 : 1
  const max = funding > 20000 ? 12 : 6

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
    projectDurationOptions.push({ key: duration, text: duration, value: duration })
  }
  return projectDurationOptions
}

function updateProjectDuration(rawFunding: string, previousDuration: number | undefined) {
  const projectFunding = Number(rawFunding) || 0
  const availableDurations = getAvailableProjectDurations(projectFunding)
  const previousDurationIsBetweenNewLimits =
    previousDuration &&
    previousDuration > availableDurations[0] &&
    previousDuration < availableDurations[availableDurations.length - 1]
  return previousDurationIsBetweenNewLimits ? previousDuration : availableDurations[0]
}

export default function GrantRequestFundingSection({ onValidation }: Props) {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_GRANT_REQUEST_FUNDING_STATE)
  const isFormEdited = userModifiedForm(state.value, INITIAL_GRANT_REQUEST_FUNDING_STATE)

  useEffect(() => {
    if (state.validated) {
      onValidation({ ...state.value }) //TODO: this should also send state.validated to parent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  const availableDurations = useMemo(() => {
    return getProjectDurationOptions(Number(state.value.funding) || 0)
  }, [state.value.funding])

  const passThreshold = useMemo(() => {
    if (isValidBudgetForCategory(Number(state.value.funding))) {
      return GrantTier.getVPThreshold(Number(state.value.funding))
    } else return undefined
  }, [state.value.funding])

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
          <div className="GrantRequestSectionCard">
            <div className="GrantRequestSectionCard__Header">
              <div className="GrantRequestSectionCard__HeaderTitle">
                {t('page.submit_grant.funding_section.project_category_title')}
              </div>
              <Button basic>{t('page.submit_grant.funding_section.project_category_action')}</Button>
            </div>
            <div>
              <div className="GrantRequestSectionCard__ContentTitle">
                <InWorldContent />
                <div>{'In-world Content'}</div>
              </div>
              <div className="GrantRequestSectionCard__SubTitle">{'New experiences to improve user retention'}</div>
            </div>
          </div>
          <div className="GrantRequestSectionCard">
            <div className="GrantRequestSectionCard__Header">
              <div className="GrantRequestSectionCard__HeaderTitle">
                {t('page.submit_grant.funding_section.category_budget_title')}
              </div>
              <Helper
                text={t('page.submit_grant.funding_section.category_budget_info')}
                size="12"
                position="right center"
              />
            </div>
            <div>
              <div className="GrantRequestSectionCard__ContentTitle GrantRequestSectionCard__AlignBaseline">
                <div className="GrantRequestSectionCard__Number">{`$${t('general.number', {
                  value: AVAILABLE_CATEGORY_BUDGET,
                })}`}</div>
                <div className="GrantRequestSectionCard__Percentage">{`(${getPercentage(
                  AVAILABLE_CATEGORY_BUDGET,
                  QUARTERLY_TOTAL_FOR_CATEGORY,
                  0
                )})`}</div>
              </div>
              <div className="GrantRequestSectionCard__CapsSubTitle">
                {t('page.submit_grant.funding_section.category_budget_total', { value: QUARTERLY_TOTAL_FOR_CATEGORY })}
              </div>
            </div>
          </div>
        </div>
        <div>
          <Label className="GrantRequestSection__InputTitle">
            {t('page.submit_grant.funding_section.expected_funding')}
          </Label>
          <Markdown className="GrantRequestSection__InputSubtitle">
            {t('page.submit_grant.funding_section.expected_funding_sub')}
          </Markdown>
          <Field
            type="number"
            value={state.value.funding}
            onChange={(_, { value }) =>
              editor.set({ funding: value, projectDuration: updateProjectDuration(value, state.value.projectDuration) })
            }
            onBlur={() => editor.set({ funding: state.value.funding })}
            error={!!state.error.funding}
            onAction={() => null}
            action={<Label className="GrantRequestSection__InputLabel">{'USD'}</Label>}
            message={t(state.error.funding)}
            disabled={false} //TODO receive property from parent on submit
          />
        </div>
        <div>
          <Label className="GrantRequestSection__InputTitle">
            {t('page.submit_grant.funding_section.project_duration_title')}
          </Label>
          <SelectField
            className="ProjectDuration"
            value={state.value.projectDuration || undefined}
            placeholder={String(state.value.projectDuration) || undefined}
            onChange={(_, { value }) => editor.set({ projectDuration: Number(value) })}
            options={availableDurations}
            error={!!state.error.projectDuration}
            message={t(state.error.projectDuration)}
            disabled={!state.value.funding || !!state.error.funding}
            loading={false}
          />
        </div>
        <div className="GrantRequestSection__Row">
          <div className="GrantRequestSectionCard">
            <div className="GrantRequestSectionCard__Header">
              <div className="GrantRequestSectionCard__HeaderTitle">
                {t('page.submit_grant.funding_section.pass_threshold_title')}
              </div>
              <Lock />
            </div>
            <div>
              <div className="GrantRequestSectionCard__ContentTitle">
                {!isValidBudgetForCategory(state.value.funding) && (
                  <Skeleton className="GrantRequestSectionCard__Empty" enableAnimation={false} />
                )}
                {isValidBudgetForCategory(state.value.funding) && (
                  <div className="GrantRequestSectionCard__Number">
                    {t('page.submit_grant.funding_section.pass_threshold', { value: passThreshold })}
                  </div>
                )}
              </div>
              <div className="GrantRequestSectionCard__SubTitle">
                {t('page.submit_grant.funding_section.pass_threshold_sub')}
              </div>
            </div>
          </div>
          <div className="GrantRequestSectionCard">
            <div className="GrantRequestSectionCard__Header">
              <div className="GrantRequestSectionCard__HeaderTitle">
                {t('page.submit_grant.funding_section.payout_strategy_title')}
              </div>
              <Lock />
            </div>
            <div>
              <div className="GrantRequestSectionCard__ContentTitle">
                {!isValidBudgetForCategory(state.value.funding) && (
                  <Skeleton className="GrantRequestSectionCard__Empty" enableAnimation={false} />
                )}
                {isValidBudgetForCategory(state.value.funding) && (
                  <div className="GrantRequestSectionCard__Number">
                    {t('page.submit_grant.funding_section.payout_strategy_payments', {
                      value: state.value.projectDuration,
                    })}
                  </div>
                )}
              </div>
              <div className="GrantRequestSectionCard__SubTitle">
                {t('page.submit_grant.funding_section.payout_strategy_sub')}
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </GrantRequestSection>
  )
}