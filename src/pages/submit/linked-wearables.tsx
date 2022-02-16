import React, { useEffect, useState } from 'react'
import Helmet from 'react-helmet'
import { navigate } from "gatsby-plugin-intl"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Field } from "decentraland-ui/dist/components/Field/Field"
import { Radio } from "decentraland-ui/dist/components/Radio/Radio"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"
import { newProposalLinkedWearablesScheme } from '../../entities/Proposal/types'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { Governance } from '../../api/Governance'
import loader from '../../modules/loader'
import locations from '../../modules/locations'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import omit from 'lodash.omit'

import './submit.css'

type LinkedWearablesState = {
  name: string,
  introduction: string,
  nft_collections: string,
  smart_contract: Record<string, string>,
  governance: string,
  motivation: string,
  managers: Record<string, string>,
  programmatically_generated: boolean,
}

const initialPollState: LinkedWearablesState = {
  name: '',
  introduction: '',
  nft_collections: '',
  smart_contract: {
    '0': ''
  },
  governance: '',
  motivation: '',
  managers: {
    '0': ''
  },
  programmatically_generated: false,
}

const schema = newProposalLinkedWearablesScheme.properties
const edit = (state: LinkedWearablesState, props: Partial<LinkedWearablesState>) => {
  return {
    ...state,
    ...props,
  }
}

const validate = createValidator<LinkedWearablesState>({
  name: (state) => ({
    name: assert(state.name.length <= schema.name.maxLength, 'error.linked_wearables.name_too_large')
  }),
  introduction: (state) => ({
    introduction: assert(state.introduction.length <= schema.introduction.maxLength, 'error.linked_wearables.introduction_too_large')
  }),
  nft_collections: (state) => ({
    nft_collections: assert(state.nft_collections.length <= schema.nft_collections.maxLength, 'error.linked_wearables.nft_collections_too_large')
  }),
  governance: (state) => ({
    governance: assert(state.governance.length <= schema.governance.maxLength, 'error.linked_wearables.governance_too_large')
  }),
  motivation: (state) => ({
    motivation: assert(state.motivation.length <= schema.motivation.maxLength, 'error.linked_wearables.motivation_too_large')
  }),
  '*': (state) => {
    const smart_contract = Object.values(state.smart_contract)
    const managers = Object.values(state.managers)
    return({
      name: (assert(state.name.length > 0, 'error.linked_wearables.name_empty') ||
      assert(state.name.length >= schema.name.minLength, 'error.linked_wearables.name_too_short') ||
      assert(state.name.length <= schema.name.maxLength, 'error.linked_wearables.name_too_large')
      ),
      introduction: (assert(state.introduction.length > 0, 'error.linked_wearables.introduction_empty') ||
      assert(state.introduction.length >= schema.introduction.minLength, 'error.linked_wearables.introduction_too_short') ||
      assert(state.introduction.length <= schema.introduction.maxLength, 'error.linked_wearables.introduction_too_large')
      ),
      nft_collections: (assert(state.nft_collections.length > 0, 'error.linked_wearables.nft_collections_empty') ||
      assert(state.nft_collections.length >= schema.nft_collections.minLength, 'error.linked_wearables.nft_collections_too_short') ||
      assert(state.nft_collections.length <= schema.nft_collections.maxLength, 'error.linked_wearables.nft_collections_too_large')
      ),
      smart_contract: (
        assert(smart_contract.some(option => option !== ''), `error.linked_wearables.smart_contract_empty`) ||
        assert(smart_contract.every(option => isEthereumAddress(option)), `error.linked_wearables.address_invalid`)
      ),
      governance: (assert(state.governance.length > 0, 'error.linked_wearables.governance_empty') ||
      assert(state.governance.length >= schema.governance.minLength, 'error.linked_wearables.governance_too_short') ||
      assert(state.governance.length <= schema.governance.maxLength, 'error.linked_wearables.governance_too_large')
      ),
      motivation: (assert(state.motivation.length > 0, 'error.linked_wearables.motivation_empty') ||
      assert(state.motivation.length >= schema.motivation.minLength, 'error.linked_wearables.motivation_too_short') ||
      assert(state.motivation.length <= schema.motivation.maxLength, 'error.linked_wearables.motivation_too_large')
      ),
      managers: (
        assert(managers.some(option => option !== ''), `error.linked_wearables.managers_empty`) ||
        assert(managers.every(option => isEthereumAddress(option)), `error.linked_wearables.address_invalid`)
      ),
    })
  }
})

export default function SubmitLinkedWearables() {
  const l = useFormatMessage()
  const [ account, accountState ] = useAuthContext()
  const [ state, editor ] = useEditor(edit, validate, initialPollState)
  const [formDisabled, setFormDisabled] = useState(false);

  function handleRemoveOption(field: 'smart_contract' | 'managers', i: string) {
    const addresses = omit(state.value[field], [ i ]) as Record<string, string>
    if (Object.keys(addresses).length < 1) {
      addresses[Date.now()] = ''
    }

    editor.set({
      ...state.value,
      [field]: addresses,
    })
  }

  function handleEditOption(field: 'smart_contract' | 'managers', i: string, value: string) {
    editor.set({
      ...state.value,
      [field]: {
        ...state.value[field],
        [i]: value
      },
    })
  }

  function handleAddOption(field: 'smart_contract' | 'managers') {
    editor.set({
      ...state.value,
      [field]: {
        ...state.value[field],
        [Date.now()]: ''
      }
    })
  }

  function handleProgrammaticallyGeneratedOption() {
    editor.set({
      ...state.value,
      programmatically_generated: !state.value.programmatically_generated
    })
  }

  useEffect(() => {
    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          return Governance.get().createProposalLinkedWearables({
            ...state.value,
            smart_contract: Object.values(state.value.smart_contract),
            managers: Object.values(state.value.managers),
          })
        })
        .then((proposal) => {
            loader.proposals.set(proposal.id, proposal)
            navigate(locations.proposal(proposal.id, {new: 'true'}), { replace: true })
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
          setFormDisabled(false)
        })
    }
  }, [ state.validated ])

  if (accountState.loading) {
    return <Container className="WelcomePage">
      <div>
        <Loader size="huge" active/>
      </div>
    </Container>
  }

  if (!account) {
    return <Container>
      <Head
        title={l('page.submit_linked_wearables.title') || ''}
        description={l('page.submit_linked_wearables.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
    </Container>
  }

  const addressesStyle: any = { width: '80%', margin: 'auto', textAlign: 'center'}

  return <ContentLayout small>
    <Head
      title={l('page.submit_linked_wearables.title') || ''}
      description={l('page.submit_linked_wearables.description') || ''}
      image="https://decentraland.org/images/decentraland.png"
    />
    <Helmet title={l('page.submit_linked_wearables.title') || ''} />
    <ContentSection>
      <Header size="huge">{l('page.submit_linked_wearables.title')}</Header>
    </ContentSection>
    <ContentSection className="MarkdownSection--tiny">
      {l.markdown('page.submit_linked_wearables.description')}
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_linked_wearables.name_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.name_detail')}</Paragraph>
      <Field
        value={state.value.name}
        placeholder={l('page.submit_linked_wearables.name_placeholder')}
        onChange={(_, { value }) => editor.set({ name: value })}
        onBlur={() => editor.set({ name: state.value.name.trim() })}
        error={!!state.error.name}
        message={
          l.optional(state.error.name) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.name.length,
            limit: schema.name.maxLength
          })
        }
        disabled={formDisabled}
      />
    </ContentSection>
    <ContentSection>
      <Label>
        {l('page.submit_linked_wearables.introduction_label')}
        <MarkdownNotice />
        </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.introduction_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.introduction}
        placeholder={l('page.submit_linked_wearables.introduction_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ introduction: value })}
        onBlur={() => editor.set({ introduction: state.value.introduction.trim() })}
        error={!!state.error.introduction}
        message={
          l.optional(state.error.introduction) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.introduction.length,
            limit: schema.introduction.maxLength
          })
        }
        disabled={formDisabled}
      />
    </ContentSection>
    <ContentSection>
      <Label>
        {l('page.submit_linked_wearables.nft_collections_label')}
        <MarkdownNotice />
        </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.nft_collections_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.nft_collections}
        placeholder={l('page.submit_linked_wearables.nft_collections_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ nft_collections: value })}
        onBlur={() => editor.set({ nft_collections: state.value.nft_collections.trim() })}
        error={!!state.error.nft_collections}
        message={
          l.optional(state.error.nft_collections) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.nft_collections.length,
            limit: schema.nft_collections.maxLength
          })
        }
        disabled={formDisabled}
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_linked_wearables.smart_contract_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.smart_contract_detail')}</Paragraph>
      <Paragraph small primary>{l.optional(state.error.smart_contract)}</Paragraph>
      <div style={{...addressesStyle}}>
        {Object.keys(state.value.smart_contract).sort().map((key, i) => <Field
          key={key}
          placeholder={l('page.submit_linked_wearables.address_placeholder', {'counter': String(i + 1)})}
          value={state.value.smart_contract[key]}
          action={<Icon name="x" />}
          onAction={() => handleRemoveOption('smart_contract', key)}
          onChange={(_, { value }) => handleEditOption('smart_contract', key, value)}
          disabled={formDisabled}
        />)}
        <Button basic onClick={() => handleAddOption('smart_contract')}>{l('page.submit_linked_wearables.address_add')}</Button>
      </div>
    </ContentSection>
    <ContentSection>
      <Label>
        {l('page.submit_linked_wearables.governance_label')}
        <MarkdownNotice />
        </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.governance_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.governance}
        placeholder={l('page.submit_linked_wearables.governance_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ governance: value })}
        onBlur={() => editor.set({ governance: state.value.governance.trim() })}
        error={!!state.error.governance}
        message={
          l.optional(state.error.governance) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.governance.length,
            limit: schema.governance.maxLength
          })
        }
        disabled={formDisabled}
      />
    </ContentSection>
    <ContentSection>
      <Label>
        {l('page.submit_linked_wearables.motivation_label')}
        <MarkdownNotice />
        </Label>
      <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.motivation_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.motivation}
        placeholder={l('page.submit_linked_wearables.motivation_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ motivation: value })}
        onBlur={() => editor.set({ motivation: state.value.motivation.trim() })}
        error={!!state.error.motivation}
        message={
          l.optional(state.error.motivation) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.motivation.length,
            limit: schema.motivation.maxLength
          })
        }
        disabled={formDisabled}
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_linked_wearables.managers_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.managers_detail')}</Paragraph>
      <Paragraph small primary>{l.optional(state.error.managers)}</Paragraph>
      <div style={{...addressesStyle}}>
        {Object.keys(state.value.managers).sort().map((key, i) => <Field
          key={key}
          placeholder={l('page.submit_linked_wearables.address_placeholder', {'counter': String(i + 1)})}
          value={state.value.managers[key]}
          action={<Icon name="x" />}
          onAction={() => handleRemoveOption('managers', key)}
          onChange={(_, { value }) => handleEditOption('managers', key, value)}
          disabled={formDisabled}
        />)}
        <Button basic onClick={() => handleAddOption('managers')}>{l('page.submit_linked_wearables.address_add')}</Button>
      </div>
    </ContentSection>
    <ContentSection>
      <Radio 
        checked={state.value.programmatically_generated}
        label={l('page.submit_linked_wearables.programmatically_generated_label')}
        onClick={handleProgrammaticallyGeneratedOption}
      />
    </ContentSection>
    <ContentSection>
      <Button primary disabled={state.validated} loading={state.validated} onClick={() => editor.validate()}>
        {l('page.submit.button_submit')}
      </Button>
    </ContentSection>
    {state.error['*'] && <ContentSection>
      <Paragraph small primary>{l(state.error['*']) || state.error['*']}</Paragraph>
    </ContentSection>}
  </ContentLayout>
}
