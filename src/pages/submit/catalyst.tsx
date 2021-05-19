import React, { useEffect, useState } from 'react'
import Helmet from 'react-helmet'
import { navigate } from 'gatsby-plugin-intl'
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Field } from "decentraland-ui/dist/components/Field/Field"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"
import { newProposalCatalystScheme } from '../../entities/Proposal/types'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { Governance } from '../../api/Governance'
import locations from '../../modules/locations'
import loader from '../../modules/loader'
import Catalyst, { Servers } from 'decentraland-gatsby/dist/utils/api/Catalyst'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import { isValidDomainName } from '../../entities/Proposal/utils'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import './submit.css'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Navigation, { NavigationTab } from '../../components/Layout/Navigation'

type CatalystState = {
  owner: string,
  domain: string,
  description: string,
}

const schema = newProposalCatalystScheme.properties

const initialPollState: CatalystState = {
  owner: '',
  domain: '',
  description: '',
}

const edit = (state: CatalystState, props: Partial<CatalystState>) => {
  return {
    ...state,
    ...props,
    owner: (props.owner ?? state.owner).toLowerCase().trim(),
    domain: (props.domain ?? state.domain).toLowerCase().trim()
  }
}

const validate = createValidator<CatalystState>({
  domain: (state) => ({
    domain: assert(!state.domain || isValidDomainName(state.domain), 'error.catalyst.domain_invalid')
  }),
  description: (state) => ({
    description: assert(state.description.length <= schema.description.maxLength, 'error.catalyst.description_too_large')
  }),
  '*': (state) => ({
    owner: (
      assert(state.owner !== '', 'error.catalyst.owner_empty') ||
      assert(isEthereumAddress(state.owner), 'error.catalyst.owner_invalid')
    ),
    domain: (
      assert(state.domain !== '', 'error.catalyst.domain_empty') ||
      assert(isValidDomainName(state.domain), 'error.catalyst.domain_invalid')
    ),
    description: (
      assert(state.description !== '', 'error.catalyst.description_empty') ||
      assert(state.description.length >= schema.description.minLength, 'error.catalyst.description_too_short') ||
      assert(state.description.length <= schema.description.maxLength, 'error.catalyst.description_too_large')
    )
  })
})

export default function SubmitCatalyst() {
  const l = useFormatMessage()
  const [ domain, setDomain ] = useState('')
  const [ account, accountState ] = useAuthContext()
  const [ state, editor ] = useEditor(edit, validate, initialPollState)
  const [ commsStatus, commsState ] = useAsyncMemo(async () => domain ? Catalyst.from('https://' + domain).getCommsStatus() : null, [ domain ])
  const [ contentStatus, contentState ] = useAsyncMemo(async () => domain ? Catalyst.from('https://' + domain).getContentStatus() : null, [ domain ])
  const [ lambdaStatus, lambdaState ] = useAsyncMemo(async () => domain ? Catalyst.from('https://' + domain).getLambdasStatus() : null, [ domain ])

  useEffect(() => {
    if (!state.error.domain && (commsState.error || contentState.error || lambdaState.error)) {
      editor.error({ domain: 'error.catalyst.server_invalid_status' })
    }
  }, [ domain, commsState.error, contentState.error, lambdaState.error, state.error.domain ])

  useEffect(() => {
    const errors = [ commsState.error, contentState.error, lambdaState.error ].filter(Boolean)
    if (state.validated && errors.length > 0) {
      editor.error({
        domain: 'error.catalyst.server_invalid_status',
        '*': 'error.catalyst.server_invalid_status',
      })
      return
    }

    const loading = [ commsState.loading, contentState.loading, lambdaState.loading ].filter(Boolean)
    if (state.validated && loading.length > 0) {
      return
    }

    if (state.validated) {
      Promise.resolve()
        .then(async () => {
          let servers: Servers[]
          try {
            servers = await Catalyst.get().getServers()
          } catch (err) {
            console.error(err)
            throw new Error(`error.catalyst.fetching_catalyst`)
          }

          if (servers.find(server => server.address === 'https://' + state.value.domain)) {
            throw new Error(`error.catalyst.domain_already_a_catalyst`)
          }

          return Governance.get()
            .createProposalCatalyst(state.value)
        })
        .then((proposal) => {
          loader.proposals.set(proposal.id, proposal)
          navigate(locations.proposal(proposal.id), { replace: true })
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
        })
    }
  }, [ state.validated, commsStatus, contentStatus, lambdaStatus ])

  if (!account) {
    return <Container>
      <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
    </Container>
  }

  return <ContentLayout small>
    <Helmet title={l('page.submit_catalyst.title') || ''} />
    <ContentSection>
      <Header size="huge">{l('page.submit_catalyst.title')}</Header>
    </ContentSection>
    <ContentSection>
      <Paragraph small>{l('page.submit_catalyst.description')}</Paragraph>
      <Paragraph small>{l('page.submit_catalyst.description_2')}</Paragraph>
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_catalyst.owner_label')}</Label>
        <Field
          type="address"
          value={state.value.owner}
          placeholder={l('page.submit_catalyst.owner_placeholder')}
          onChange={(_, { value }) => editor.set({ owner: value }, { validate: false })}
          onBlur={() => editor.set({ owner: state.value.owner.trim() })}
          message={l.optional(state.error.owner)}
          error={!!state.error.owner}
        />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_catalyst.domain_label')}</Label>
        <Field
          value={state.value.domain}
          placeholder={l('page.submit_catalyst.domain_placeholder')}
          onChange={(_, { value }) => editor.set({ domain: value.trim() }, { validate: false })}
          onBlur={() => {
            editor.set({ domain: state.value.domain.trim() })
            setDomain(state.value.domain)
          }}
          error={!!state.error.domain || !!(domain && !isValidDomainName(domain))}
          message={l.optional(state.error.domain)}
        />
        {!!domain && <div>
          <Paragraph tiny>
            {commsState.loading && <span style={{ display: 'block', color: '#676370' }}>{l('page.submit_catalyst.domain_comms_checking')}</span>}
            {commsState.error && <span style={{ display: 'block', color: '#ff0000' }}>{l('page.submit_catalyst.domain_comms_failed')}</span>}
            {!commsState.loading && !commsState.error && <span style={{ display: 'block', color: '#59a14f' }}>{l('page.submit_catalyst.domain_comms_ok')}</span>}
            {contentState.loading && <span style={{ display: 'block', color: '#676370' }}>{l('page.submit_catalyst.domain_content_checking')}</span>}
            {contentState.error && <span style={{ display: 'block', color: '#ff0000' }}>{l('page.submit_catalyst.domain_content_failed')}</span>}
            {!contentState.loading && !contentState.error && <span style={{ display: 'block', color: '#59a14f' }}>{l('page.submit_catalyst.domain_content_ok')}</span>}
            {lambdaState.loading && <span style={{ display: 'block', color: '#676370' }}>{l('page.submit_catalyst.domain_lambda_checking')}</span>}
            {lambdaState.error && <span style={{ display: 'block', color: '#ff0000' }}>{l('page.submit_catalyst.domain_lambda_failed')}</span>}
            {!lambdaState.loading && !lambdaState.error && <span style={{ display: 'block', color: '#59a14f' }}>{l('page.submit_catalyst.domain_lambda_ok')}</span>}
          </Paragraph>
        </div>}
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_catalyst.description_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_catalyst.description_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.description}
        placeholder={l('page.submit_catalyst.description_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ description: value })}
        onBlur={() => editor.set({ description: state.value.description.trim() })}
        error={!!state.error.description || state.value.description.length > schema.description.maxLength}
        message={
          l.optional(state.error.description) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.description.length,
            limit: schema.description.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection>
      <Button primary
        disabled={state.validated || commsState.loading || contentState.loading || lambdaState.loading}
        loading={state.validated || commsState.loading || contentState.loading || lambdaState.loading}
        onClick={() => editor.validate()}
      >
        {l('page.submit.button_submit')}
      </Button>
    </ContentSection>
    {state.error['*'] && <ContentSection>
      <Paragraph small primary>{l(state.error['*']) || state.error['*']}</Paragraph>
    </ContentSection>}
  </ContentLayout>
}
