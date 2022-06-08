import React, { useEffect, useState } from 'react'
import Helmet from 'react-helmet'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { Governance } from '../../../api/Governance'
import { PoiType, getPoiTypeAction, newProposalPOIScheme } from '../../../entities/Proposal/types'
import { asNumber, isAlreadyPointOfInterest, isValidPointOfInterest } from '../../../entities/Proposal/utils'
import loader from '../../../modules/loader'
import locations from '../../../modules/locations'
import MarkdownNotice from '../../Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../Layout/ContentLayout'
import LoadingView from '../../Layout/LoadingView'
import LogIn from '../../User/LogIn'

import './ProposalSubmitPoiPage.css'

type POIState = {
  x: string | number
  y: string | number
  description: string
}

const schema = newProposalPOIScheme.properties
const initialPoiState: POIState = {
  x: '',
  y: '',
  description: '',
}

const edit = (state: POIState, props: Partial<POIState>) => {
  return {
    ...state,
    ...props,
  }
}

function assertInMap(value: string | number) {
  if (value === '') {
    return undefined
  }

  const x = asNumber(value)
  return (
    assert(!Number.isNaN(x) && Number.isFinite(x), 'error.poi.coordinates_not_a_number') ||
    assert(x <= schema.x.maximum && x >= schema.x.minimum, 'error.poi.coordinates_out_of_map') ||
    undefined
  )
}

const validate = createValidator<POIState>({
  x: (state) => ({ x: assertInMap(state.x) }),
  y: (state) => ({ y: assertInMap(state.y) }),
  description: (state) => ({
    description: assert(state.description.length <= schema.description.maxLength, 'error.poi.description_too_large'),
  }),
  '*': (state) => ({
    x: assert(state.x !== '', 'error.poi.coordinates_incomplete') || assertInMap(state.x),
    y: assert(state.y !== '', 'error.poi.coordinates_incomplete') || assertInMap(state.y),
    description:
      assert(state.description.length > 0, 'error.poi.description_empty') ||
      assert(state.description.length >= schema.description.minLength, 'error.poi.description_too_short') ||
      assert(state.description.length <= schema.description.maxLength, 'error.poi.description_too_large'),
  }),
})

async function validateTilePointOfInterest(x: number, y: number) {
  let validPointOfInterest: boolean
  try {
    validPointOfInterest = await isValidPointOfInterest(x, y)
  } catch (err) {
    console.log(err)
    throw new Error(`error.poi.fetching_tiles`)
  }

  if (!validPointOfInterest) {
    throw new Error(`error.poi.coordinates_invalid_poi`)
  }
}

async function validateAlreadyPointOfInterest(x: number, y: number, required: boolean) {
  let alreadyPointOfInterest: boolean
  try {
    alreadyPointOfInterest = await isAlreadyPointOfInterest(x, y)
  } catch (err) {
    console.log(err)
    throw new Error(`error.poi.fetching_pois`)
  }

  if (required) {
    if (!alreadyPointOfInterest) {
      throw new Error(`error.poi.coordinates_are_not_a_poi`)
    }
  } else {
    if (alreadyPointOfInterest) {
      throw new Error(`error.poi.coordinates_already_a_poi`)
    }
  }
}

export type ProposalPoiPageProps = {
  poiType: PoiType
}

export default React.memo(function ProposalSubmitPoiPage({ poiType }: ProposalPoiPageProps) {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialPoiState)
  const [formDisabled, setFormDisabled] = useState(false)
  const action = getPoiTypeAction(poiType)

  useEffect(() => {
    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          const x = asNumber(state.value.x)
          const y = asNumber(state.value.y)

          switch (poiType) {
            case PoiType.AddPOI:
              await validateAlreadyPointOfInterest(x, y, false)
              await validateTilePointOfInterest(x, y)
              break
            case PoiType.RemovePOI:
              await validateAlreadyPointOfInterest(x, y, true)
              break
            default:
              throw new Error(`error.poi.invalid_poi_type`)
          }

          return Governance.get().createProposalPOI({
            x,
            y,
            type: poiType,
            description: state.value.description,
          })
        })
        .then((proposal) => {
          loader.proposals.set(proposal.id, proposal)
          navigate(locations.proposal(proposal.id, { new: 'true' }), {
            replace: true,
          })
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
          setFormDisabled(false)
        })
    }
  }, [editor, poiType, state])

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return (
      <LogIn title={t(`page.submit_poi.${action}.title`) || ''} description={t('page.submit_poi.description') || ''} />
    )
  }

  return (
    <ContentLayout small>
      <Head
        title={t(`page.submit_poi.${action}.title`) || ''}
        description={t('page.submit_poi.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t(`page.submit_poi.${action}.title`) || ''} />
      <ContentSection>
        <Header size="huge">{t(`page.submit_poi.${action}.title`)}</Header>
      </ContentSection>
      <ContentSection>
        <Paragraph small>{t('page.submit_poi.description')}</Paragraph>
      </ContentSection>
      <ContentSection className="CoordinatesField">
        <Label>{t(`page.submit_poi.${action}.coordinates_label`)}</Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_poi.coordinates_detail')}
        </Paragraph>
        <div className="CoordinatesField__Inputs">
          <Field
            value={state.value.x}
            type="number"
            min={schema.x.minimum}
            max={schema.x.maximum}
            placeholder={t('page.submit_poi.x_placeholder')}
            onChange={(_, { value }) => editor.set({ x: value })}
            error={!!state.error.x}
            disabled={formDisabled}
          />
          <Field
            value={state.value.y}
            type="number"
            min={schema.y.minimum}
            max={schema.y.maximum}
            placeholder={t('page.submit_poi.y_placeholder')}
            onChange={(_, { value }) => editor.set({ y: value })}
            error={!!state.error.y}
            disabled={formDisabled}
          />

          <div className="CoordinatesField__Error">
            <Paragraph tiny primary>
              {t(state.error.x) || t(state.error.y)}
            </Paragraph>
          </div>
        </div>
      </ContentSection>
      <ContentSection>
        <Label>
          {t('page.submit_poi.description_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t(`page.submit_poi.${action}.description_detail`)}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.description}
          placeholder={t(`page.submit_poi.${action}.description_placeholder`)}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ description: value })}
          onBlur={() => editor.set({ description: state.value.description.trim() })}
          error={!!state.error.description}
          message={
            t(state.error.description) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.description.length,
              limit: schema.description.maxLength,
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Button primary disabled={state.validated} loading={state.validated} onClick={() => editor.validate()}>
          {t('page.submit.button_submit')}
        </Button>
      </ContentSection>
      {state.error['*'] && (
        <ContentSection>
          <Paragraph small primary>
            {t(state.error['*']) || state.error['*']}
          </Paragraph>
        </ContentSection>
      )}
    </ContentLayout>
  )
})
