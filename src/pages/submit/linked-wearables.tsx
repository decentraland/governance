import { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field as DCLField } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../clients/Governance'
import Field from '../../components/Common/Form/Field'
import MarkdownField from '../../components/Common/Form/MarkdownField'
import SubLabel from '../../components/Common/SubLabel'
import Label from '../../components/Common/Typography/Label'
import Markdown from '../../components/Common/Typography/Markdown'
import Text from '../../components/Common/Typography/Text'
import ErrorMessage from '../../components/Error/ErrorMessage'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import Head from '../../components/Layout/Head'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/Layout/LogIn'
import PostLabel from '../../components/PostLabel'
import CoAuthors from '../../components/Proposal/Submit/CoAuthor/CoAuthors'
import { ProposalType, newProposalLinkedWearablesScheme } from '../../entities/Proposal/types'
import { asNumber, isValidImage } from '../../entities/Proposal/utils'
import { useAuthContext } from '../../front/context/AuthProvider'
import { disableOnWheelInput, isHttpsURL } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import locations, { navigate } from '../../utils/locations'

import './submit.css'

type LinkedWearablesState = {
  name: string
  marketplace_link: string
  image_previews: Record<string, string>
  links: Record<string, string>
  nft_collections: string
  items: string
  smart_contract: Record<string, string>
  governance: string
  motivation: string
  managers: Record<string, string>
  programmatically_generated: boolean
  method: string
  coAuthors?: string[]
}

type ListSectionType = {
  section: 'smart_contract' | 'managers' | 'links' | 'image_previews'
  type: 'address' | 'url' | 'image'
}

type ListSectionValidator = (input: string) => string | undefined

const initialState: LinkedWearablesState = {
  name: '',
  marketplace_link: '',
  image_previews: {
    '0': '',
  },
  links: {
    '0': '',
  },
  nft_collections: '',
  items: '1',
  smart_contract: {
    '0': '',
  },
  governance: '',
  motivation: '',
  managers: {
    '0': '',
  },
  programmatically_generated: false,
  method: '',
}

const schema = newProposalLinkedWearablesScheme.properties
const MAX_IMAGES = schema.image_previews.maxItems

const removeEmptyStrings = (array: string[]) => array.filter((item) => item)

const getImagesValidation = async (urls: Record<string, string>) => {
  const errors: string[] = []
  for (const [key, value] of Object.entries(urls)) {
    if (value) {
      const isValid = await isValidImage(value)
      if (!isValid) {
        errors.push(key)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export default function SubmitLinkedWearables() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    setError: setFormError,
    clearErrors,
    watch,
  } = useForm<LinkedWearablesState>({ defaultValues: initialState, mode: 'onTouched' })
  const [formDisabled, setFormDisabled] = useState(false)
  const [formErrorKeys, setFormErrorKeys] = useState('')
  const [error, setError] = useState('')
  const preventNavigation = useRef(false)
  const values = useWatch({ control })

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const handleAddOption = (e: React.MouseEvent<HTMLButtonElement>, field: ListSectionType['section']) => {
    e.preventDefault()
    clearErrors(field)
    setValue(field, {
      ...values[field],
      [Date.now()]: '',
    })
  }

  const handleRemoveOption = (field: ListSectionType['section'], i: string) => {
    clearErrors(field)
    const addresses = omit(values[field], [i]) as Record<string, string>
    if (Object.keys(addresses).length < 1) {
      addresses[Date.now()] = ''
    }

    setValue(field, addresses)
  }

  const handleEditOption = (field: ListSectionType['section'], i: string, value: string) => {
    clearErrors(field)
    setValue(field, {
      ...values[field],
      [i]: value,
    } as Record<string, string>)
  }

  const handleErrorOption = (input: string, field: ListSectionType['section'], validator: ListSectionValidator) => {
    const error = validator(input)
    if (input !== '' && error) {
      setFormError(field, { message: (errors[field]?.message as unknown as string) || error })
    }
  }

  const handleProgrammaticallyGeneratedOption = () => {
    setValue('programmatically_generated', !values.programmatically_generated)
  }

  const urlValidator: ListSectionValidator = (input: string) => {
    if (!isHttpsURL(input)) {
      return t('error.linked_wearables.url_invalid')
    }
  }

  const addressValidator: ListSectionValidator = (input: string) => {
    if (!isEthereumAddress(input)) {
      return t('error.linked_wearables.address_invalid')
    }
  }

  const getListSection = (
    params: ListSectionType,
    validator: ListSectionValidator,
    detailOptions?: Record<string, unknown>,
    maxAmount?: number
  ) => {
    const sectionValue = values[params.section] as Record<string, string>
    const items = Object.values(sectionValue)
    const canAdd = !maxAmount || maxAmount < 0 || (items.length < maxAmount && maxAmount !== 1)
    return (
      <ContentSection>
        <Label>{t(`page.submit_linked_wearables.${params.section}_label`)}</Label>
        <SubLabel>{t(`page.submit_linked_wearables.${params.section}_detail`, detailOptions)}</SubLabel>
        {errors && (
          <Text size="lg" color="primary">
            {errors[params.section]?.message}
          </Text>
        )}
        <div className="SectionList">
          {values &&
            Object.keys(sectionValue)
              .sort()
              .map((key) => (
                <DCLField
                  key={key}
                  placeholder={t(`page.submit_linked_wearables.${params.type}_placeholder`)}
                  value={sectionValue?.[key]}
                  action={<Icon name="x" />}
                  onAction={() => handleRemoveOption(params.section, key)}
                  onChange={(_, { value }) => handleEditOption(params.section, key, value)}
                  disabled={formDisabled}
                  error={!!errors[params.section]?.message}
                  onBlur={() => handleErrorOption(sectionValue[key], params.section, validator)}
                />
              ))}
          {canAdd && (
            <Button basic onClick={(e) => handleAddOption(e, params.section)}>
              {t(`page.submit_linked_wearables.${params.type}_add`)}
            </Button>
          )}
        </div>
      </ContentSection>
    )
  }

  const onSubmit: SubmitHandler<LinkedWearablesState> = async (data) => {
    clearErrors()

    if (Object.values(data.image_previews).some((option) => option === '')) {
      setFormError('image_previews', { message: t('error.linked_wearables.links_empty') })

      return
    }

    if (Object.values(data.links).some((option) => option === '')) {
      setFormError('links', { message: t('error.linked_wearables.links_empty') })

      return
    }

    if (Object.values(data.smart_contract).some((option) => option === '')) {
      setFormError('smart_contract', { message: t('error.linked_wearables.smart_contract_empty') })

      return
    }

    if (Object.values(data.managers).some((option) => option === '')) {
      setFormError('managers', { message: t('error.linked_wearables.managers_empty') })

      return
    }

    setFormDisabled(true)
    const imagesValidaton = await getImagesValidation(data.image_previews)
    if (!imagesValidaton.isValid) {
      setFormError('image_previews', { message: t('error.linked_wearables.image_type_invalid') })
      setFormDisabled(false)

      return
    }

    try {
      const proposal = await Governance.get().createProposalLinkedWearables({
        ...data,
        items: Number(data.items),
        links: removeEmptyStrings(Object.values(data.links)),
        smart_contract: removeEmptyStrings(Object.values(data.smart_contract)),
        managers: removeEmptyStrings(Object.values(data.managers)),
        image_previews: removeEmptyStrings(Object.values(data.image_previews)),
      })

      navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  useEffect(() => {
    const errorFields = Object.keys(omitBy(errors, isNil)) as (keyof LinkedWearablesState)[]
    const errorFieldsStr = JSON.stringify(errorFields)
    if (errorFields.length > 0 && errorFieldsStr !== formErrorKeys) {
      setError(
        `${errorFields
          .map((key) =>
            errors[key]?.message ? `${t(`page.submit_linked_wearables.${key}_label`)}: ${errors[key]?.message}` : ''
          )
          .join('\n')}`
      )
      setFormErrorKeys(errorFieldsStr)
    }

    if (errorFields.length === 0) {
      setFormErrorKeys('')
    }
  }, [errors, formErrorKeys, t])

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return (
      <LogIn
        title={t('page.submit_linked_wearables.title')}
        description={t('page.submit_linked_wearables.description')}
      />
    )
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_linked_wearables.title')}
        description={t('page.submit_linked_wearables.description')}
        links={[{ rel: 'canonical', href: locations.submit(ProposalType.LinkedWearables) }]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_linked_wearables.title')}</Header>
        </ContentSection>
        <ContentSection>
          <Markdown>{t('page.submit_linked_wearables.description')}</Markdown>
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_linked_wearables.name_label')}</Label>
          <SubLabel>{t('page.submit_linked_wearables.name_detail')}</SubLabel>
          <Field
            control={control}
            name="name"
            placeholder={t('page.submit_linked_wearables.name_placeholder')}
            rules={{
              required: { value: true, message: t('error.linked_wearables.name_empty') },
              minLength: {
                value: schema.name.minLength,
                message: t('error.linked_wearables.name_too_short'),
              },
              maxLength: {
                value: schema.name.maxLength,
                message: t('error.linked_wearables.name_too_large'),
              },
            }}
            error={!!errors.name}
            message={
              (errors.name?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('name').length,
                limit: schema.name.maxLength,
              })
            }
            disabled={formDisabled}
          />
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_linked_wearables.marketplace_link_label')}</Label>
          <SubLabel>{t('page.submit_linked_wearables.marketplace_link_detail')}</SubLabel>
          <Field
            name="marketplace_link"
            control={control}
            rules={{
              required: { value: true, message: t('error.linked_wearables.single_url_empty') },
              validate: (value: string) => {
                if (!isHttpsURL(value)) {
                  return t('error.linked_wearables.single_url_invalid')
                }
              },
            }}
            placeholder={t('page.submit_linked_wearables.url_placeholder')}
            error={!!errors.marketplace_link}
            message={errors.marketplace_link?.message}
            disabled={formDisabled}
          />
        </ContentSection>
        {getListSection({ section: 'links', type: 'url' }, urlValidator)}
        {getListSection({ section: 'image_previews', type: 'image' }, urlValidator, { amount: MAX_IMAGES }, MAX_IMAGES)}
        <ContentSection>
          <Label>
            {t('page.submit_linked_wearables.nft_collections_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_linked_wearables.nft_collections_detail')}</SubLabel>
          <MarkdownField
            name="nft_collections"
            control={control}
            rules={{
              required: { value: true, message: t('error.linked_wearables.nft_collections_empty') },
              minLength: {
                value: schema.nft_collections.minLength,
                message: t('error.linked_wearables.nft_collections_too_short'),
              },
              maxLength: {
                value: schema.nft_collections.maxLength,
                message: t('error.linked_wearables.nft_collections_too_large'),
              },
            }}
            placeholder={t('page.submit_linked_wearables.nft_collections_placeholder')}
            error={!!errors.nft_collections}
            message={
              (errors.nft_collections?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('nft_collections').length,
                limit: schema.nft_collections.maxLength,
              })
            }
            disabled={formDisabled}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_linked_wearables.motivation_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_linked_wearables.motivation_detail')}</SubLabel>
          <MarkdownField
            name="motivation"
            control={control}
            placeholder={t('page.submit_linked_wearables.motivation_placeholder')}
            rules={{
              required: { value: true, message: t('error.linked_wearables.motivation_empty') },
              minLength: {
                value: schema.motivation.minLength,
                message: t('error.linked_wearables.motivation_too_short'),
              },
              maxLength: {
                value: schema.motivation.maxLength,
                message: t('error.linked_wearables.motivation_too_large'),
              },
            }}
            error={!!errors.motivation}
            message={
              (errors.motivation?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('motivation').length,
                limit: schema.motivation.maxLength,
              })
            }
            disabled={formDisabled}
          />
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_linked_wearables.items_label')}</Label>
          <SubLabel>{t('page.submit_linked_wearables.items_detail')}</SubLabel>
          <Field
            control={control}
            type="number"
            name="items"
            rules={{
              validate: (value: string) => {
                if (!Number.isFinite(asNumber(value))) {
                  return t('error.linked_wearables.items_invalid')
                }
                if (asNumber(value) < schema.items.minimum) {
                  return t('error.linked_wearables.items_too_low')
                }
                if (asNumber(value) > schema.items.maximum) {
                  return t('error.linked_wearables.items_too_high')
                }
              },
            }}
            error={!!errors.items}
            onAction={() => null}
            message={errors.items?.message}
            disabled={formDisabled}
            onWheel={disableOnWheelInput}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_linked_wearables.governance_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_linked_wearables.governance_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="governance"
            placeholder={t('page.submit_linked_wearables.governance_placeholder')}
            rules={{
              required: { value: true, message: t('error.linked_wearables.governance_empty') },
              minLength: {
                value: schema.governance.minLength,
                message: t('error.linked_wearables.governance_too_short'),
              },
              maxLength: {
                value: schema.governance.maxLength,
                message: t('error.linked_wearables.governance_too_large'),
              },
            }}
            error={!!errors.governance}
            message={
              (errors.governance?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('governance').length,
                limit: schema.governance.maxLength,
              })
            }
            disabled={formDisabled}
          />
        </ContentSection>
        {getListSection({ section: 'smart_contract', type: 'address' }, addressValidator)}
        {getListSection({ section: 'managers', type: 'address' }, addressValidator)}
        <ContentSection>
          <Label>{t('page.submit_linked_wearables.programmatically_generated_label')}</Label>
          <SubLabel>{t('page.submit_linked_wearables.programmatically_generated_description')}</SubLabel>
          <div className="ProgrammaticallyGeneratedRadioButtons">
            <Radio
              checked={watch('programmatically_generated')}
              label={
                <label>
                  <Markdown componentsClassNames={{ p: 'ProposalSubmit__RadioLabelText' }}>
                    {t('modal.votes_list.voted_yes')}
                  </Markdown>
                </label>
              }
              onChange={handleProgrammaticallyGeneratedOption}
            />
            <Radio
              checked={!watch('programmatically_generated')}
              label={
                <label>
                  <Markdown componentsClassNames={{ p: 'ProposalSubmit__RadioLabelText' }}>
                    {t('modal.votes_list.voted_no')}
                  </Markdown>
                </label>
              }
              onChange={handleProgrammaticallyGeneratedOption}
            />
          </div>
          <PostLabel>{t('page.submit_linked_wearables.programmatically_generated_note')}</PostLabel>
        </ContentSection>
        {values.programmatically_generated && (
          <ContentSection>
            <Label>
              {t('page.submit_linked_wearables.method_label')}
              <MarkdownNotice />
            </Label>
            <SubLabel>{t('page.submit_linked_wearables.method_detail')}</SubLabel>
            <MarkdownField
              control={control}
              name="method"
              placeholder={t('page.submit_linked_wearables.method_placeholder')}
              rules={{
                required: { value: true, message: t('error.linked_wearables.method_empty') },
                minLength: {
                  value: schema.method.minLength,
                  message: t('error.linked_wearables.method_too_short'),
                },
                maxLength: {
                  value: schema.method.maxLength,
                  message: t('error.linked_wearables.method_too_large'),
                },
              }}
              error={!!errors.method}
              message={
                (errors.method?.message || '') +
                ' ' +
                t('page.submit.character_counter', {
                  current: watch('method').length,
                  limit: schema.method.maxLength,
                })
              }
              disabled={formDisabled}
            />
          </ContentSection>
        )}
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary disabled={formDisabled} loading={isSubmitting}>
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
