import React, { useEffect, useState } from 'react'
import Helmet from 'react-helmet'
import { navigate } from "gatsby-plugin-intl"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Field } from "decentraland-ui/dist/components/Field/Field"
import { Radio } from "decentraland-ui/dist/components/Radio/Radio"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { newProposalLinkedWearablesScheme } from '../../entities/Proposal/types'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { Governance } from '../../api/Governance'
import loader from '../../modules/loader'
import locations from '../../modules/locations'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import isURL from 'validator/lib/isURL'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import omit from 'lodash.omit'
import LogIn from '../../components/User/LogIn'

import './submit.css'

type LinkedWearablesState = {
  name: string,
  links: Record<string, string>,
  nft_collections: string,
  smart_contract: Record<string, string>,
  governance: string,
  motivation: string,
  managers: Record<string, string>,
  programmatically_generated: boolean,
  method: string,
}

type ListSectionType = {
  section: 'smart_contract' | 'managers' | 'links'
  type: 'address' | 'url'
}

const initialPollState: LinkedWearablesState = {
  name: '',
  links: {
    '0': ''
  },
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
  method: '',
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
  nft_collections: (state) => ({
    nft_collections: assert(state.nft_collections.length <= schema.nft_collections.maxLength, 'error.linked_wearables.nft_collections_too_large')
  }),
  governance: (state) => ({
    governance: assert(state.governance.length <= schema.governance.maxLength, 'error.linked_wearables.governance_too_large')
  }),
  motivation: (state) => ({
    motivation: assert(state.motivation.length <= schema.motivation.maxLength, 'error.linked_wearables.motivation_too_large')
  }),
  method: (state) => ({
    method: assert(state.method.length <= schema.method.maxLength, 'error.linked_wearables.method_too_large')
  }),
  '*': (state) => {
    const links = Object.values(state.links)
    const smart_contract = Object.values(state.smart_contract)
    const managers = Object.values(state.managers)
    return({
      name: (assert(state.name.length > 0, 'error.linked_wearables.name_empty') ||
      assert(state.name.length >= schema.name.minLength, 'error.linked_wearables.name_too_short') ||
      assert(state.name.length <= schema.name.maxLength, 'error.linked_wearables.name_too_large')
      ),
      links: (
        assert(links.some(option => option !== ''), `error.linked_wearables.smart_contract_empty`) ||
        assert(links.every(option => isURL(option, {protocols: ['https'], require_protocol: true})), `error.linked_wearables.url_invalid`)
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
      method: (assert(state.method.length <= schema.method.maxLength, 'error.linked_wearables.method_too_large')
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
  const [formDisabled, setFormDisabled] = useState(false)

  const handleRemoveOption = (field: 'smart_contract' | 'managers' | 'links', i: string) => {
    const addresses = omit(state.value[field], [ i ]) as Record<string, string>
    if (Object.keys(addresses).length < 1) {
      addresses[Date.now()] = ''
    }

    editor.set({
      ...state.value,
      [field]: addresses,
    })
  }

  const handleEditOption = (field: 'smart_contract' | 'managers' | 'links', i: string, value: string) => {
    editor.set({
      ...state.value,
      [field]: {
        ...state.value[field],
        [i]: value
      },
    })
  }

  const handleAddOption = (field: 'smart_contract' | 'managers' | 'links') => {
    editor.set({
      ...state.value,
      [field]: {
        ...state.value[field],
        [Date.now()]: ''
      }
    })
  }

  const handleProgrammaticallyGeneratedOption = () => {
    editor.set({
      ...state.value,
      programmatically_generated: !state.value.programmatically_generated
    })
  }

  const getListSection = (params: ListSectionType) => {
    return <ContentSection>
      <Label>{l(`page.submit_linked_wearables.${params.section}_label`)}</Label>
      <Paragraph tiny secondary className="details">{l(`page.submit_linked_wearables.${params.section}_detail`)}</Paragraph>
      <Paragraph small primary>{l.optional(state.error[params.section])}</Paragraph>
      <div className='SectionList'>
        {Object.keys(state.value[params.section]).sort().map((key) => <Field
          key={key}
          placeholder={l(`page.submit_linked_wearables.${params.type}_placeholder`)}
          value={state.value[params.section][key]}
          action={<Icon name="x" />}
          onAction={() => handleRemoveOption(params.section, key)}
          onChange={(_, { value }) => handleEditOption(params.section, key, value)}
          disabled={formDisabled}
        />)}
        <Button basic onClick={() => handleAddOption(params.section)}>{l(`page.submit_linked_wearables.${params.type}_add`)}</Button>
      </div>
    </ContentSection>
  }

  useEffect(() => {
    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          return Governance.get().createProposalLinkedWearables({
            ...state.value,
            links: Object.values(state.value.links),
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
    return <LogIn
      title={l('page.submit_linked_wearables.title') || ''}
      description={l('page.submit_linked_wearables.description') || ''}
    />
  }

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
    {
      getListSection({section: 'links', type: 'url'})
    }
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
    {
      getListSection({section: 'smart_contract', type: 'address'})
    }
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
    {getListSection({section: 'managers', type: 'address'})}
    <ContentSection>
      <Label>
        {l('page.submit_linked_wearables.programmatically_generated_label')}
      </Label>
      <Paragraph tiny secondary className="ProgrammaticallyGeneratedLabel">
        {l('page.submit_linked_wearables.programmatically_generated_description')}
      </Paragraph>
      <div className="ProgrammaticallyGeneratedRadioButtons">
      <span>
        <Radio
          checked={state.value.programmatically_generated}
          label={<label><Markdown source={l('modal.votes_list.voted_yes') || ''} /></label>}
          onChange={handleProgrammaticallyGeneratedOption}
        />
      </span>
      <span style={{marginLeft: '10px'}}>
        <Radio
          checked={!state.value.programmatically_generated}
          label={<label><Markdown source={l('modal.votes_list.voted_no') || ''} /></label>}
          onChange={handleProgrammaticallyGeneratedOption}
        />
      </span>
      </div>
      <Paragraph tiny secondary className="ProgrammaticallyGeneratedLabel">
        <Markdown className="tinyMarkdown" source={l('page.submit_linked_wearables.programmatically_generated_note') || ''} />
      </Paragraph>
    </ContentSection>
    {state.value.programmatically_generated && (
      <ContentSection>
        <Label>
          {l('page.submit_linked_wearables.method_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">{l('page.submit_linked_wearables.method_detail')}</Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.method}
          placeholder={l('page.submit_linked_wearables.method_placeholder')}
          onChange={(_: any, { value }: any) => editor.set({ method: value })}
          onBlur={() => editor.set({ method: state.value.method.trim() })}
          error={!!state.error.method}
          message={
            l.optional(state.error.method) + ' ' +
            l('page.submit.character_counter', {
              current: state.value.method.length,
              limit: schema.method.maxLength
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
    )}
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
