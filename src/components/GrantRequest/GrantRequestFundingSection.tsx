import React, { useEffect, useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { GrantTier } from '../../entities/Grant/GrantTier'
import { isValidGrantBudget } from '../../entities/Grant/utils'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import Helper from '../Helper/Helper'
import InWorldContent from '../Icon/Grants/InWorldContent'
import Lock from '../Icon/Lock'
import { ContentSection } from '../Layout/ContentLayout'

import { GrantRequestFundingSchema } from './GrantRequestSchema'
import GrantRequestSection from './GrantRequestSection'


export type GrantRequestFundingState = {
  funding: string | number
  projectDuration: number
}

const schema = GrantRequestFundingSchema
export const INITIAL_GRANT_REQUEST_FUNDING_STATE: GrantRequestFundingState = { funding: String(schema.funding), projectDuration: 0 }

const validate = createValidator<GrantRequestFundingState>({
  funding: (state) => ({
    funding:
      assert(!state.funding || Number.isFinite(asNumber(state.funding)), 'error.grant.size_invalid') ||
      assert(!state.funding || asNumber(state.funding) >= schema.funding.minimum, 'error.grant.size_too_low') ||
      assert(!state.funding || asNumber(state.funding) <= schema.funding.maximum, 'error.grant.size_too_big') ||
      assert(
        !state.funding || (!!state.funding && isValidGrantBudget(Number(state.funding))),
        'error.grant.size_tier_invalid'
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
    if (isValidGrantBudget(Number(state.value.funding))) {
      return GrantTier.getVPThreshold(Number(state.value.funding))
    } else return undefined
  }, [state.value.funding])

  return (
    <GrantRequestSection
      onBlur={() => editor.validate()}
      validated={state.validated}
      isFormEdited={isFormEdited}
      sectionTitle={'Funding'}
      sectionNumber={1}
    >
      <ContentSection className="GrantRequestSection__Content">
        <div className="FundingBoxes">
          <div className="FundingBox">
            <div className="FundingBox__Header">
              <div className="FundingBox__HeaderTitle">{'Project Category'}</div>
              <Button basic>{'Change'}</Button>
            </div>
            <div>
              <div className="FundingBox__ContentTitle">
                <InWorldContent />
                <div>{'In-world Content'}</div>
              </div>
              <div className="FundingBox__SubTitle">{'New experiences to improve user retention'}</div>
            </div>
          </div>
          <div className="FundingBox">
            <div className="FundingBox__Header">
              <div className="FundingBox__HeaderTitle">{'Category Budget'}</div>
              <Helper text={'Missing copy'} size="12" position="right center" />
            </div>
            <div>
              <div className="FundingBox__ContentTitle FundingBox__AlignBaseline">
                <div className="FundingBox__Number">{`$${t('general.number', { value: 1234567 })}`}</div>
                <div className="FundingBox__Percentage">{'(45%)'}</div>
              </div>
              <div className="FundingBox__CapsSubTitle">{'Category total for q: $2,500,000'}</div>
            </div>
          </div>
        </div>
        <div className="FundingBoxes__ExpectedFunding">
          <Label>{'Expected Funding'}</Label>
          <Field
            type="number"
            value={state.value.funding}
            onChange={(_, { value }) =>
              editor.set({ funding: value, projectDuration: updateProjectDuration(value, state.value.projectDuration) })
            }
            onBlur={() => editor.set({ funding: state.value.funding })}
            error={!!state.error.funding}
            onAction={() => null}
            message={t(state.error.funding)}
            disabled={false} //TODO receive property from parent on submit
          />
          <Paragraph tiny secondary className="details">
            {'More about Funding Tiers'}
          </Paragraph>
        </div>
        <div className="FundingBoxes__ProjectDuration">
          <Label>{'Expected Project Duration'}</Label>
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
        <div className="FundingBoxes">
          <div className="FundingBox">
            <div className="FundingBox__Header">
              <div className="FundingBox__HeaderTitle">{'Pass Threshold'}</div>
              <Lock />
            </div>
            <div>
              <div className="FundingBox__ContentTitle">
                {!passThreshold && <Skeleton className="FundingBox__Empty" enableAnimation={false} />}
                {!!passThreshold && (
                  <div className="FundingBox__Number">{t('general.number', { value: passThreshold })} VP</div>
                )}
              </div>
              <div className="FundingBox__SubTitle">{'Accumulated VP needed for this proposal to pass'}</div>
            </div>
          </div>
          <div className="FundingBox">
            <div className="FundingBox__Header">
              <div className="FundingBox__HeaderTitle">{'Payout Strategy'}</div>
              <Lock />
            </div>
            <div>
              <div className="FundingBox__ContentTitle">
                {!passThreshold && <Skeleton className="FundingBox__Empty" enableAnimation={false} />}
                {!!passThreshold && (
                  <div className="FundingBox__Number">{`${state.value.projectDuration} Monthly Payments`}</div>
                )}
              </div>
              <div className="FundingBox__SubTitle">{'Executed 7 days after the proposal has passed'}</div>
            </div>
          </div>
        </div>
      </ContentSection>
    </GrantRequestSection>
  )
}
