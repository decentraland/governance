import React, { useEffect, useState } from 'react'
import Helmet from 'react-helmet'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Catalyst, { Servers } from 'decentraland-gatsby/dist/utils/api/Catalyst'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../api/Governance'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { newProposalCatalystScheme } from '../../entities/Proposal/types'
import { isValidDomainName } from '../../entities/Proposal/utils'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './catalyst.css'
import './submit.css'

type CatalystState = {
  owner: string
  domain: string
  description: string
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
    domain: (props.domain ?? state.domain).toLowerCase().trim(),
  }
}

const validate = createValidator<CatalystState>({
  owner: (state) => ({
    domain: assert(!state.owner || isEthereumAddress(state.owner), 'error.catalyst.owner_invalid'),
  }),
  domain: (state) => ({
    domain: assert(!state.domain || isValidDomainName(state.domain), 'error.catalyst.domain_invalid'),
  }),
  description: (state) => ({
    description: assert(
      state.description.length <= schema.description.maxLength,
      'error.catalyst.description_too_large'
    ),
  }),
  '*': (state) => ({
    owner:
      assert(state.owner !== '', 'error.catalyst.owner_empty') ||
      assert(isEthereumAddress(state.owner), 'error.catalyst.owner_invalid'),
    domain:
      assert(state.domain !== '', 'error.catalyst.domain_empty') ||
      assert(isValidDomainName(state.domain), 'error.catalyst.domain_invalid'),
    description:
      assert(state.description !== '', 'error.catalyst.description_empty') ||
      assert(state.description.length >= schema.description.minLength, 'error.catalyst.description_too_short') ||
      assert(state.description.length <= schema.description.maxLength, 'error.catalyst.description_too_large'),
  }),
})

export default function SubmitCatalyst() {
  const t = useFormatMessage()
  const [domain, setDomain] = useState('')
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialPollState)
  const [commsStatus, commsState] = useAsyncMemo(
    async () => (domain ? Catalyst.from('https://' + domain).getCommsStatus() : null),
    [domain]
  )
  const [contentStatus, contentState] = useAsyncMemo(
    async () => (domain ? Catalyst.from('https://' + domain).getContentStatus() : null),
    [domain]
  )
  const [lambdaStatus, lambdaState] = useAsyncMemo(
    async () => (domain ? Catalyst.from('https://' + domain).getLambdasStatus() : null),
    [domain]
  )
  const [formDisabled, setFormDisabled] = useState(false)

  useEffect(() => {
    if (!state.error.domain && (commsState.error || contentState.error || lambdaState.error)) {
      editor.error({ domain: 'error.catalyst.server_invalid_status' })
    }
  }, [domain, commsState.error, contentState.error, lambdaState.error, state.error.domain, editor])

  useEffect(() => {
    const errors = [commsState.error, contentState.error, lambdaState.error].filter(Boolean)
    if (state.validated && errors.length > 0) {
      editor.error({
        domain: 'error.catalyst.server_invalid_status',
        '*': 'error.catalyst.server_invalid_status',
      })
      return
    }

    const loading = [commsState.loading, contentState.loading, lambdaState.loading].filter(Boolean)
    if (state.validated && loading.length > 0) {
      return
    }

    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          let servers: Servers[]
          try {
            servers = await Catalyst.get().getServers()
          } catch (err) {
            console.error(err)
            throw new Error('error.catalyst.fetching_catalyst')
          }

          if (servers.find((server) => server.baseUrl === 'https://' + state.value.domain)) {
            throw new Error('error.catalyst.domain_already_a_catalyst')
          }

          return Governance.get().createProposalCatalyst(state.value)
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.validated, commsStatus, contentStatus, lambdaStatus])

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return (
      <LogIn title={t('page.submit_catalyst.title') || ''} description={t('page.submit_catalyst.description') || ''} />
    )
  }

  return (
    <ContentLayout small>
      <Head
        title={t('page.submit_catalyst.title') || ''}
        description={t('page.submit_catalyst.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_catalyst.title') || ''} />
      <ContentSection>
        <Header size="huge">{t('page.submit_catalyst.title')}</Header>
      </ContentSection>
      <ContentSection>
        <Paragraph small>{t('page.submit_catalyst.description')}</Paragraph>
        <Paragraph small>{t('page.submit_catalyst.description_2')}</Paragraph>
      </ContentSection>
      <ContentSection>
        <Label>{t('page.submit_catalyst.owner_label')}</Label>
        <Field
          type="address"
          value={state.value.owner}
          placeholder={t('page.submit_catalyst.owner_placeholder')}
          onChange={(_, { value }) => editor.set({ owner: value }, { validate: false })}
          onBlur={() => editor.set({ owner: state.value.owner.trim() })}
          message={t(state.error.owner)}
          error={!!state.error.owner}
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>{t('page.submit_catalyst.domain_label')}</Label>
        <Field
          value={state.value.domain}
          placeholder={t('page.submit_catalyst.domain_placeholder')}
          onChange={(_, { value }) => editor.set({ domain: value.trim() }, { validate: false })}
          onBlur={() => {
            editor.set({ domain: state.value.domain.trim() })
            setDomain(state.value.domain)
          }}
          error={!!state.error.domain || !!(domain && !isValidDomainName(domain))}
          message={t(state.error.domain)}
          disabled={formDisabled}
        />
        {!!domain && (
          <div>
            <Paragraph tiny>
              {commsState.loading && (
                <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_comms_checking')}</span>
              )}
              {commsState.error && (
                <span className="Catalyst__Error">{t('page.submit_catalyst.domain_comms_failed')}</span>
              )}
              {!commsState.loading && !commsState.error && (
                <span className="Catalyst__Success">{t('page.submit_catalyst.domain_comms_ok')}</span>
              )}
              {contentState.loading && (
                <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_content_checking')}</span>
              )}
              {contentState.error && (
                <span className="Catalyst__Error">{t('page.submit_catalyst.domain_content_failed')}</span>
              )}
              {!contentState.loading && !contentState.error && (
                <span className="Catalyst__Success">{t('page.submit_catalyst.domain_content_ok')}</span>
              )}
              {lambdaState.loading && (
                <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_lambda_checking')}</span>
              )}
              {lambdaState.error && (
                <span className="Catalyst__Error">{t('page.submit_catalyst.domain_lambda_failed')}</span>
              )}
              {!lambdaState.loading && !lambdaState.error && (
                <span className="Catalyst__Success">{t('page.submit_catalyst.domain_lambda_ok')}</span>
              )}
            </Paragraph>
          </div>
        )}
      </ContentSection>
      <ContentSection>
        <Label>
          {t('page.submit_catalyst.description_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_catalyst.description_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.description}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ description: value })}
          onBlur={() => editor.set({ description: state.value.description.trim() })}
          error={!!state.error.description || state.value.description.length > schema.description.maxLength}
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
        <Button
          primary
          disabled={state.validated || commsState.loading || contentState.loading || lambdaState.loading}
          loading={state.validated || commsState.loading || contentState.loading || lambdaState.loading}
          onClick={() => editor.validate()}
        >
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
}
