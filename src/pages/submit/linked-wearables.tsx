import React, { useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'
import omit from 'lodash/omit'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../clients/Governance'
import ErrorMessage from '../../components/Error/ErrorMessage'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import CoAuthors from '../../components/Proposal/Submit/CoAuthor/CoAuthors'
import LogIn from '../../components/User/LogIn'
import { newProposalLinkedWearablesScheme } from '../../entities/Proposal/types'
import { asNumber, isValidImage, userModifiedForm } from '../../entities/Proposal/utils'
import { isHttpsURL } from '../../helpers'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './submit.css'

type LinkedWearablesState = {
  name: string
  image_previews: Record<string, string>
  marketplace_link: string
  links: Record<string, string>
  nft_collections: string
  items: number
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
  image_previews: {
    '0': '',
  },
  marketplace_link: '',
  links: {
    '0': '',
  },
  nft_collections: '',
  items: 1,
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

const edit = (state: LinkedWearablesState, props: Partial<LinkedWearablesState>) => {
  return {
    ...state,
    ...props,
  }
}

const validate = createValidator<LinkedWearablesState>({
  name: (state) => ({
    name: assert(state.name.length <= schema.name.maxLength, 'error.linked_wearables.name_too_large'),
  }),
  nft_collections: (state) => ({
    nft_collections: assert(
      state.nft_collections.length <= schema.nft_collections.maxLength,
      'error.linked_wearables.nft_collections_too_large'
    ),
  }),
  governance: (state) => ({
    governance: assert(
      state.governance.length <= schema.governance.maxLength,
      'error.linked_wearables.governance_too_large'
    ),
  }),
  motivation: (state) => ({
    motivation: assert(
      state.motivation.length <= schema.motivation.maxLength,
      'error.linked_wearables.motivation_too_large'
    ),
  }),
  method: (state) => ({
    method: assert(state.method.length <= schema.method.maxLength, 'error.linked_wearables.method_too_large'),
  }),
  '*': (state) => {
    const image_previews = Object.values(state.image_previews)
    const links = Object.values(state.links)
    const smart_contract = Object.values(state.smart_contract)
    const managers = Object.values(state.managers)
    return {
      name:
        assert(state.name.length > 0, 'error.linked_wearables.name_empty') ||
        assert(state.name.length >= schema.name.minLength, 'error.linked_wearables.name_too_short') ||
        assert(state.name.length <= schema.name.maxLength, 'error.linked_wearables.name_too_large'),
      image_previews: assert(
        image_previews.some((option) => option !== ''),
        'error.linked_wearables.links_empty'
      ),
      marketplace_link:
        assert(state.marketplace_link.length > 0, 'error.linked_wearables.single_url_empty') ||
        assert(isHttpsURL(state.marketplace_link), 'error.linked_wearables.single_url_invalid'),
      links: assert(
        links.some((option) => option !== ''),
        'error.linked_wearables.links_empty'
      ),
      nft_collections:
        assert(state.nft_collections.length > 0, 'error.linked_wearables.nft_collections_empty') ||
        assert(
          state.nft_collections.length >= schema.nft_collections.minLength,
          'error.linked_wearables.nft_collections_too_short'
        ) ||
        assert(
          state.nft_collections.length <= schema.nft_collections.maxLength,
          'error.linked_wearables.nft_collections_too_large'
        ),
      items:
        assert(Number.isFinite(asNumber(state.items)), 'error.linked_wearables.items_invalid') ||
        assert(asNumber(state.items) >= schema.items.minimum, 'error.linked_wearables.items_too_low') ||
        assert(asNumber(state.items) <= schema.items.maximum, 'error.linked_wearables.items_too_high'),
      smart_contract: assert(
        smart_contract.some((option) => option !== ''),
        'error.linked_wearables.smart_contract_empty'
      ),
      governance:
        assert(state.governance.length > 0, 'error.linked_wearables.governance_empty') ||
        assert(state.governance.length >= schema.governance.minLength, 'error.linked_wearables.governance_too_short') ||
        assert(state.governance.length <= schema.governance.maxLength, 'error.linked_wearables.governance_too_large'),
      motivation:
        assert(state.motivation.length > 0, 'error.linked_wearables.motivation_empty') ||
        assert(state.motivation.length >= schema.motivation.minLength, 'error.linked_wearables.motivation_too_short') ||
        assert(state.motivation.length <= schema.motivation.maxLength, 'error.linked_wearables.motivation_too_large'),
      method: assert(state.method.length <= schema.method.maxLength, 'error.linked_wearables.method_too_large'),
      managers: assert(
        managers.some((option) => option !== ''),
        'error.linked_wearables.managers_empty'
      ),
    }
  },
})

const removeEmptyStrings = (array: string[]) => array.filter((item) => item)

const urlValidator: ListSectionValidator = (input: string) => {
  return assert(isHttpsURL(input), 'error.linked_wearables.url_invalid')
}

const addressValidator: ListSectionValidator = (input: string) => {
  return assert(isEthereumAddress(input), 'error.linked_wearables.address_invalid')
}

const imagesValidator = async (urls: Record<string, string>) => {
  const errors: string[] = []
  for (const [key, value] of Object.entries(urls)) {
    if (value) {
      const isValid = await isValidImage(value)
      if (!isValid) {
        errors.push(key)
      }
    }
  }

  return errors
}

export default function SubmitLinkedWearables() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialState)
  const [formDisabled, setFormDisabled] = useState(false)
  const [formErrorKeys, setFormErrorKeys] = useState('')
  const [listSectionErrors, setListSectionErrors] = useState<Record<ListSectionType['section'], string[]>>({
    image_previews: [],
    links: [],
    smart_contract: [],
    managers: [],
  })
  const preventNavigation = useRef(false)

  const setCoAuthors = (addresses?: string[]) => editor.set({ coAuthors: addresses })

  const handleRemoveOption = (field: ListSectionType['section'], i: string) => {
    const addresses = omit(state.value[field], [i]) as Record<string, string>
    if (Object.keys(addresses).length < 1) {
      addresses[Date.now()] = ''
    }

    editor.set({
      ...state.value,
      [field]: addresses,
    })
  }

  const handleEditOption = (field: ListSectionType['section'], i: string, value: string) => {
    editor.set({
      ...state.value,
      [field]: {
        ...state.value[field],
        [i]: value,
      },
    })
  }

  const handleAddOption = (field: ListSectionType['section']) => {
    editor.set({
      ...state.value,
      [field]: {
        ...state.value[field],
        [Date.now()]: '',
      },
    })
  }

  const handleErrorOption = (
    input: string,
    fieldKey: string,
    field: ListSectionType['section'],
    validator: ListSectionValidator
  ) => {
    const error = validator(input)
    if (input !== '' && error) {
      setListSectionErrors({
        ...listSectionErrors,
        [field]: [...listSectionErrors[field], fieldKey],
      })
      editor.error({ [field]: state.error[field] || error })
    } else {
      setListSectionErrors({
        ...listSectionErrors,
        [field]: listSectionErrors[field].filter((key) => key !== fieldKey),
      })
      editor.error({ [field]: undefined })
    }
  }

  const handleProgrammaticallyGeneratedOption = () => {
    editor.set({
      ...state.value,
      programmatically_generated: !state.value.programmatically_generated,
    })
  }

  const getListSection = (
    params: ListSectionType,
    validator: ListSectionValidator,
    detailOptions?: Record<string, unknown>,
    maxAmount?: number
  ) => {
    const items = Object.values(state.value[params.section])
    const canAdd = !maxAmount || maxAmount < 0 || (items.length < maxAmount && maxAmount !== 1)
    return (
      <ContentSection>
        <Label>{t(`page.submit_linked_wearables.${params.section}_label`)}</Label>
        <Paragraph tiny secondary className="details">
          {t(`page.submit_linked_wearables.${params.section}_detail`, detailOptions)}
        </Paragraph>
        <Paragraph small primary>
          {t(state.error[params.section])}
        </Paragraph>
        <div className="SectionList">
          {Object.keys(state.value[params.section])
            .sort()
            .map((key) => (
              <Field
                key={key}
                placeholder={t(`page.submit_linked_wearables.${params.type}_placeholder`)}
                value={state.value[params.section][key]}
                action={<Icon name="x" />}
                onAction={() => handleRemoveOption(params.section, key)}
                onChange={(_, { value }) => handleEditOption(params.section, key, value)}
                disabled={formDisabled}
                error={listSectionErrors[params.section].includes(key)}
                onBlur={() => handleErrorOption(state.value[params.section][key], key, params.section, validator)}
              />
            ))}
          {canAdd && (
            <Button basic onClick={() => handleAddOption(params.section)}>
              {t(`page.submit_linked_wearables.${params.type}_add`)}
            </Button>
          )}
        </div>
      </ContentSection>
    )
  }

  useEffect(() => {
    preventNavigation.current = userModifiedForm(state.value, initialState)

    if (state.validated) {
      setFormDisabled(true)
      imagesValidator(state.value.image_previews).then((errors) => {
        if (errors.length === 0) {
          Promise.resolve()
            .then(async () => {
              return Governance.get().createProposalLinkedWearables({
                ...state.value,
                links: removeEmptyStrings(Object.values(state.value.links)),
                smart_contract: removeEmptyStrings(Object.values(state.value.smart_contract)),
                managers: removeEmptyStrings(Object.values(state.value.managers)),
                image_previews: removeEmptyStrings(Object.values(state.value.image_previews)),
              })
            })
            .then((proposal) => {
              loader.proposals.set(proposal.id, proposal)
              navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
            })
            .catch((err) => {
              console.error(err, { ...err })
              editor.error({ '*': err.body?.error || err.message })
              setFormDisabled(false)
            })
        } else {
          setListSectionErrors((prev) => ({ ...prev, image_previews: errors }))
          editor.error({ image_previews: 'error.linked_wearables.image_type_invalid' })
          setFormDisabled(false)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, state.value])

  useEffect(() => {
    const errorFields = Object.keys(state.error) as (keyof LinkedWearablesState | '*')[]
    const errorFieldsStr = JSON.stringify(errorFields)
    if (errorFields.length > 0 && errorFieldsStr !== formErrorKeys) {
      editor.error({
        '*': `${errorFields
          .map((key) =>
            key !== '*' ? `${t(`page.submit_linked_wearables.${key}_label`)}: ${t(state.error[key])}` : ''
          )
          .join('\n')}`,
      })
      setFormErrorKeys(errorFieldsStr)
    }

    if (errorFields.length === 0) {
      setFormErrorKeys('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.error])

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return (
      <LogIn
        title={t('page.submit_linked_wearables.title') || ''}
        description={t('page.submit_linked_wearables.description') || ''}
      />
    )
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_linked_wearables.title') || ''}
        description={t('page.submit_linked_wearables.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_linked_wearables.title') || ''} />
      <ContentSection>
        <Header size="huge">{t('page.submit_linked_wearables.title')}</Header>
      </ContentSection>
      <ContentSection className="MarkdownSection--tiny">
        <Markdown>{t('page.submit_linked_wearables.description')}</Markdown>
      </ContentSection>
      <ContentSection>
        <Label>{t('page.submit_linked_wearables.name_label')}</Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_linked_wearables.name_detail')}
        </Paragraph>
        <Field
          value={state.value.name}
          placeholder={t('page.submit_linked_wearables.name_placeholder')}
          onChange={(_, { value }) => editor.set({ name: value })}
          onBlur={() => editor.set({ name: state.value.name.trim() })}
          error={!!state.error.name}
          message={
            t(state.error.name) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.name.length,
              limit: schema.name.maxLength,
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>{t('page.submit_linked_wearables.marketplace_link_label')}</Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_linked_wearables.marketplace_link_detail')}
        </Paragraph>
        <Field
          value={state.value.marketplace_link}
          placeholder={t('page.submit_linked_wearables.url_placeholder')}
          onChange={(_, { value }) => editor.set({ marketplace_link: value })}
          onBlur={() => editor.set({ marketplace_link: state.value.marketplace_link.trim() })}
          error={!!state.error.marketplace_link}
          message={t(state.error.marketplace_link)}
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
        <Paragraph tiny secondary className="details">
          {t('page.submit_linked_wearables.nft_collections_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.nft_collections}
          placeholder={t('page.submit_linked_wearables.nft_collections_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ nft_collections: value })}
          onBlur={() => editor.set({ nft_collections: state.value.nft_collections.trim() })}
          error={!!state.error.nft_collections}
          message={
            t(state.error.nft_collections) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.nft_collections.length,
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
        <Paragraph tiny secondary className="details">
          {t('page.submit_linked_wearables.motivation_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.motivation}
          placeholder={t('page.submit_linked_wearables.motivation_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ motivation: value })}
          onBlur={() => editor.set({ motivation: state.value.motivation.trim() })}
          error={!!state.error.motivation}
          message={
            t(state.error.motivation) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.motivation.length,
              limit: schema.motivation.maxLength,
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>{t('page.submit_linked_wearables.items_label')}</Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_linked_wearables.items_detail')}
        </Paragraph>
        <Field
          type="number"
          value={state.value.items}
          onChange={(_, { value }) => editor.set({ items: value ? Number(value) : undefined })}
          error={!!state.error.items}
          onAction={() => null}
          message={t(state.error.items)}
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>
          {t('page.submit_linked_wearables.governance_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_linked_wearables.governance_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.governance}
          placeholder={t('page.submit_linked_wearables.governance_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ governance: value })}
          onBlur={() => editor.set({ governance: state.value.governance.trim() })}
          error={!!state.error.governance}
          message={
            t(state.error.governance) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.governance.length,
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
        <Paragraph tiny secondary className="ProgrammaticallyGeneratedLabel">
          {t('page.submit_linked_wearables.programmatically_generated_description')}
        </Paragraph>
        <div className="ProgrammaticallyGeneratedRadioButtons">
          <Radio
            checked={state.value.programmatically_generated}
            label={
              <label>
                <Markdown>{t('modal.votes_list.voted_yes') || ''}</Markdown>
              </label>
            }
            onChange={handleProgrammaticallyGeneratedOption}
          />
          <Radio
            checked={!state.value.programmatically_generated}
            label={
              <label>
                <Markdown>{t('modal.votes_list.voted_no') || ''}</Markdown>
              </label>
            }
            onChange={handleProgrammaticallyGeneratedOption}
          />
        </div>
        <Paragraph tiny secondary className="ProgrammaticallyGeneratedLabel">
          <Markdown className="tinyMarkdown">
            {t('page.submit_linked_wearables.programmatically_generated_note') || ''}
          </Markdown>
        </Paragraph>
      </ContentSection>
      {state.value.programmatically_generated && (
        <ContentSection>
          <Label>
            {t('page.submit_linked_wearables.method_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_linked_wearables.method_detail')}
          </Paragraph>
          <MarkdownTextarea
            minHeight={175}
            value={state.value.method}
            placeholder={t('page.submit_linked_wearables.method_placeholder')}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ method: value })}
            onBlur={() => editor.set({ method: state.value.method.trim() })}
            error={!!state.error.method}
            message={
              t(state.error.method) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.method.length,
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
        <Button primary disabled={state.validated} loading={state.validated} onClick={() => editor.validate()}>
          {t('page.submit.button_submit')}
        </Button>
      </ContentSection>
      {state.error['*'] && (
        <ContentSection>
          <ErrorMessage label={t('page.submit.error_label')} errorMessage={t(state.error['*']) || state.error['*']} />
        </ContentSection>
      )}
    </ContentLayout>
  )
}
