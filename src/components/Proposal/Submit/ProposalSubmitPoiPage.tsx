import React, { useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { Governance } from '../../../clients/Governance'
import { PoiType, getPoiTypeAction, newProposalPOIScheme } from '../../../entities/Proposal/types'
import { asNumber, isAlreadyPointOfInterest, isValidPointOfInterest } from '../../../entities/Proposal/utils'
import loader from '../../../modules/loader'
import locations from '../../../modules/locations'
import ErrorMessage from '../../Error/ErrorMessage'
import MarkdownNotice from '../../Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../Layout/ContentLayout'
import LoadingView from '../../Layout/LoadingView'
import LogIn from '../../User/LogIn'

import CoAuthors from './CoAuthor/CoAuthors'

import './ProposalSubmitPoiPage.css'

type POIState = {
  x: string | number
  y: string | number
  description: string
  coAuthors?: string[]
}

const schema = newProposalPOIScheme.properties
const initialState: POIState = {
  x: '',
  y: '',
  description: '',
}

async function validateTilePointOfInterest(x: number, y: number) {
  let validPointOfInterest: boolean
  try {
    validPointOfInterest = await isValidPointOfInterest(x, y)
  } catch (err) {
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

const getPoiErrorMessageKey = (errorType: string) => {
  switch (errorType) {
    case 'required':
      return 'error.poi.coordinates_incomplete'
    case 'max':
    case 'min':
    default:
      return 'error.poi.coordinates_out_of_map'
  }
}

const getDescriptionErrorMessageKey = (errorType: string) => {
  switch (errorType) {
    case 'maxLength':
      return `error.poi.description_too_large`
    case 'minLength':
      return `error.poi.description_too_short`
    default:
      return `error.poi.description_empty`
  }
}

interface Props {
  poiType: PoiType
}

export default function ProposalSubmitPoiPage({ poiType }: Props) {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [formDisabled, setFormDisabled] = useState(false)
  const action = getPoiTypeAction(poiType)
  const preventNavigation = useRef(false)
  const [error, setError] = useState('')

  const {
    handleSubmit,
    formState: { isDirty, errors },
    control,
    setValue,
    watch,
  } = useForm<POIState>({ defaultValues: initialState })

  const onSubmit: SubmitHandler<POIState> = async (data) => {
    setFormDisabled(true)

    try {
      const x = asNumber(data.x)
      const y = asNumber(data.y)

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

      const proposal = await Governance.get().createProposalPOI({
        ...data,
        type: poiType,
        x,
        y,
      })

      loader.proposals.set(proposal.id, proposal)
      navigate(locations.proposal(proposal.id, { new: 'true' }), {
        replace: true,
      })
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return (
      <LogIn title={t(`page.submit_poi.${action}.title`) || ''} description={t('page.submit_poi.description') || ''} />
    )
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t(`page.submit_poi.${action}.title`) || ''}
        description={t('page.submit_poi.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t(`page.submit_poi.${action}.title`) || ''} />
      <form onSubmit={handleSubmit(onSubmit)}>
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
            <Controller
              control={control}
              name="x"
              rules={{
                required: true,
                min: schema.x.minimum,
                max: schema.x.maximum,
              }}
              render={({ field: { ref, ...field } }) => (
                <Field
                  type="number"
                  min={schema.x.minimum}
                  max={schema.x.maximum}
                  placeholder={t('page.submit_poi.x_placeholder')}
                  error={!!errors.x}
                  disabled={formDisabled}
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="y"
              rules={{
                required: true,
                min: schema.y.minimum,
                max: schema.y.maximum,
              }}
              render={({ field: { ref, ...field } }) => (
                <Field
                  type="number"
                  min={schema.y.minimum}
                  max={schema.y.maximum}
                  placeholder={t('page.submit_poi.y_placeholder')}
                  error={!!errors.y}
                  disabled={formDisabled}
                  {...field}
                />
              )}
            />

            {errors && (
              <div className="CoordinatesField__Error">
                <Paragraph tiny primary>
                  {t(getPoiErrorMessageKey(errors.x?.type || '')) || t(getPoiErrorMessageKey(errors.y?.type || ''))}
                </Paragraph>
              </div>
            )}
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
          <Controller
            control={control}
            name="description"
            rules={{ required: true, minLength: schema.description.minLength, maxLength: schema.description.maxLength }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                placeholder={t(`page.submit_poi.${action}.description_placeholder`)}
                disabled={formDisabled}
                error={!!errors.description}
                message={
                  t(getDescriptionErrorMessageKey(errors.description?.type || '')) +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('description').length,
                    limit: schema.description.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary loading={formDisabled} disabled={formDisabled}>
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {error && (
          <ContentSection>
            <ErrorMessage label={t('page.submit.error_label')} errorMessage={t(error) || error} />
          </ContentSection>
        )}
      </form>
    </ContentLayout>
  )
}
