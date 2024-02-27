import { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { Governance } from '../../../clients/Governance'
import { PoiType, ProposalType, getPoiTypeAction, newProposalPOIScheme } from '../../../entities/Proposal/types'
import { asNumber, isAlreadyPointOfInterest, isValidPointOfInterest } from '../../../entities/Proposal/utils'
import { useAuthContext } from '../../../front/context/AuthProvider'
import { disableOnWheelInput } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import locations, { navigate } from '../../../utils/locations'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import SubLabel from '../../Common/SubLabel'
import Label from '../../Common/Typography/Label'
import Text from '../../Common/Typography/Text'
import ErrorMessage from '../../Error/ErrorMessage'
import MarkdownNotice from '../../Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../Layout/ContentLayout'
import Head from '../../Layout/Head'
import LoadingView from '../../Layout/LoadingView'
import LogIn from '../../Layout/LogIn'

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

      navigate(locations.proposal(proposal.id, { new: 'true' }), {
        replace: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    return <LogIn title={t(`page.submit_poi.${action}.title`)} description={t('page.submit_poi.description')} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t(`page.submit_poi.${action}.title`)}
        description={t('page.submit_poi.description')}
        links={[{ rel: 'canonical', href: locations.submit(ProposalType.POI, { request: poiType }) }]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t(`page.submit_poi.${action}.title`)}</Header>
        </ContentSection>
        <ContentSection>
          <Text size="lg">{t('page.submit_poi.description')}</Text>
        </ContentSection>
        <ContentSection className="CoordinatesField">
          <Label>{t(`page.submit_poi.${action}.coordinates_label`)}</Label>
          <SubLabel>{t('page.submit_poi.coordinates_detail')}</SubLabel>
          <div className="CoordinatesField__Inputs">
            <Field
              control={control}
              name="x"
              rules={{
                required: { value: true, message: t('error.poi.coordinates_incomplete') },
                min: { value: schema.x.minimum, message: t('error.poi.coordinates_out_of_map') },
                max: { value: schema.x.maximum, message: t('error.poi.coordinates_out_of_map') },
              }}
              type="number"
              min={schema.x.minimum}
              max={schema.x.maximum}
              placeholder={t('page.submit_poi.x_placeholder')}
              error={!!errors.x}
              disabled={formDisabled}
              onWheel={disableOnWheelInput}
            />

            <Field
              control={control}
              name="y"
              rules={{
                required: { value: true, message: t('error.poi.coordinates_incomplete') },
                min: { value: schema.y.minimum, message: t('error.poi.coordinates_out_of_map') },
                max: { value: schema.y.maximum, message: t('error.poi.coordinates_out_of_map') },
              }}
              type="number"
              min={schema.y.minimum}
              max={schema.y.maximum}
              placeholder={t('page.submit_poi.y_placeholder')}
              error={!!errors.y}
              disabled={formDisabled}
              onWheel={disableOnWheelInput}
            />

            {(errors.x || errors.y) && (
              <div className="CoordinatesField__Error">
                <Text color="primary">{t(errors.x?.message || '') || t(errors.y?.message || '')}</Text>
              </div>
            )}
          </div>
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_poi.description_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t(`page.submit_poi.${action}.description_detail`)}</SubLabel>
          <MarkdownField
            control={control}
            name="description"
            rules={{
              required: { value: true, message: t('error.poi.description_empty') },
              minLength: { value: schema.description.minLength, message: t('error.poi.description_too_short') },
              maxLength: { value: schema.description.maxLength, message: t('error.poi.description_too_large') },
            }}
            placeholder={t(`page.submit_poi.${action}.description_placeholder`)}
            disabled={formDisabled}
            error={!!errors.description}
            message={
              (errors.description?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('description').length,
                limit: schema.description.maxLength,
              })
            }
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
