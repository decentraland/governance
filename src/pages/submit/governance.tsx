import React, { useEffect, useMemo, useState } from 'react'
import Helmet from 'react-helmet'

import { useLocation } from '@gatsbyjs/reach-router'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../api/Governance'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LogIn from '../../components/User/LogIn'
import { NewProposalDraft, newProposalGovernanceScheme } from '../../entities/Proposal/types'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './submit.css'

type GovernanceState = {
  linked_proposal_id: string | null
  title: string
  summary: string
  abstract: string
  motivation: string
  specification: string
  impacts: string
  implementation_pathways: string
  conclusion: string
}

const initialState: GovernanceState = {
  linked_proposal_id: null,
  title: '',
  summary: '',
  abstract: '',
  motivation: '',
  specification: '',
  impacts: '',
  implementation_pathways: '',
  conclusion: '',
}
const schema = newProposalGovernanceScheme.properties
const edit = (state: GovernanceState, props: Partial<GovernanceState>) => {
  return {
    ...state,
    ...props,
  }
}
const validate = createValidator<GovernanceState>({
  title: (state) => ({
    title: assert(state.title.length <= schema.title.maxLength, 'error.governance.title_too_large') || undefined,
  }),
  summary: (state) => ({
    summary:
      assert(state.summary.length <= schema.summary.maxLength, 'error.governance.summary_too_large') || undefined,
  }),
  abstract: (state) => ({
    abstract:
      assert(state.abstract.length <= schema.abstract.maxLength, 'error.governance.abstract_too_large') || undefined,
  }),
  motivation: (state) => ({
    motivation:
      assert(state.motivation.length <= schema.motivation.maxLength, 'error.governance.motivation_too_large') ||
      undefined,
  }),
  impacts: (state) => ({
    impacts:
      assert(state.impacts.length <= schema.impacts.maxLength, 'error.governance.impacts_too_large') || undefined,
  }),
  implementation_pathways: (state) => ({
    implementation_pathways:
      assert(
        state.implementation_pathways.length <= schema.implementation_pathways.maxLength,
        'error.governance.implementation_pathways_too_large'
      ) || undefined,
  }),
  specification: (state) => ({
    specification:
      assert(
        state.specification.length <= schema.specification.maxLength,
        'error.governance.specification_too_large'
      ) || undefined,
  }),
  conclusion: (state) => ({
    conclusion:
      assert(state.conclusion.length <= schema.conclusion.maxLength, 'error.governance.conclusion_too_large') ||
      undefined,
  }),
  '*': (state) => ({
    linked_proposal_id: assert(!!state.linked_proposal_id, 'error.governance.linked_proposal_empty'),
    title:
      assert(state.title.length > 0, 'error.governance.title_empty') ||
      assert(state.title.length >= schema.title.minLength, 'error.governance.title_too_short') ||
      assert(state.title.length <= schema.title.maxLength, 'error.governance.title_too_large'),
    summary:
      assert(state.summary.length > 0, 'error.governance.summary_empty') ||
      assert(state.summary.length >= schema.summary.minLength, 'error.governance.summary_too_short') ||
      assert(state.summary.length <= schema.summary.maxLength, 'error.governance.summary_too_large'),
    abstract:
      assert(state.abstract.length > 0, 'error.governance.abstract_empty') ||
      assert(state.abstract.length >= schema.abstract.minLength, 'error.governance.abstract_too_short') ||
      assert(state.abstract.length <= schema.abstract.maxLength, 'error.governance.abstract_too_large'),
    motivation:
      assert(state.motivation.length > 0, 'error.governance.motivation_empty') ||
      assert(state.motivation.length >= schema.motivation.minLength, 'error.governance.motivation_too_short') ||
      assert(state.motivation.length <= schema.motivation.maxLength, 'error.governance.motivation_too_large'),
    impacts:
      assert(state.impacts.length > 0, 'error.governance.impacts_empty') ||
      assert(state.impacts.length >= schema.impacts.minLength, 'error.governance.impacts_too_short') ||
      assert(state.impacts.length <= schema.impacts.maxLength, 'error.governance.impacts_too_large'),
    implementation_pathways:
      assert(state.implementation_pathways.length > 0, 'error.governance.implementation_pathways_empty') ||
      assert(
        state.implementation_pathways.length >= schema.implementation_pathways.minLength,
        'error.governance.implementation_pathways_too_short'
      ) ||
      assert(
        state.implementation_pathways.length <= schema.implementation_pathways.maxLength,
        'error.governance.implementation_pathways_too_large'
      ),
    specification:
      assert(state.specification.length > 0, 'error.governance.specification_empty') ||
      assert(
        state.specification.length >= schema.specification.minLength,
        'error.governance.specification_too_short'
      ) ||
      assert(state.specification.length <= schema.specification.maxLength, 'error.governance.specification_too_large'),
    conclusion:
      assert(state.conclusion.length > 0, 'error.governance.conclusion_empty') ||
      assert(state.conclusion.length >= schema.conclusion.minLength, 'error.governance.conclusion_too_short') ||
      assert(state.conclusion.length <= schema.conclusion.maxLength, 'error.governance.conclusion_too_large'),
  }),
})

export default function SubmitGovernanceProposal() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const preselectedLinkedProposalId = params.get('linked_proposal_id')
  const [account, accountState] = useAuthContext()
  const accountBalance = isEthereumAddress(params.get('address') || '') ? params.get('address') : account
  const { votingPower, isLoadingVotingPower } = useVotingPowerBalance(accountBalance)
  const submissionVpNotMet = useMemo(
    () => votingPower < Number(process.env.GATSBY_SUBMISSION_THRESHOLD_GOVERNANCE),
    [votingPower]
  )
  const [state, editor] = useEditor(edit, validate, initialState)
  const [preselectedProposal] = useAsyncMemo(
    async () => {
      if (!preselectedLinkedProposalId) return undefined
      const proposal = await Governance.get().getProposal(preselectedLinkedProposalId)
      if (!proposal) return undefined
      return [
        {
          key: proposal.id,
          text: proposal.title,
          value: proposal.id,
        },
      ]
    },
    [],
    { initialValue: undefined }
  )
  const [formDisabled, setFormDisabled] = useState(false)

  useEffect(() => {
    if (preselectedLinkedProposalId) {
      Promise.resolve()
        .then(async () => {
          return await Governance.get().getProposal(preselectedLinkedProposalId)
        })
        .then((linkedProposal) => {
          if (linkedProposal) {
            const configuration = linkedProposal.configuration as NewProposalDraft
            editor.set({
              linked_proposal_id: linkedProposal.id,
              title: configuration.title,
              summary: configuration.summary,
              abstract: configuration.abstract,
              motivation: configuration.motivation,
              specification: configuration.specification,
              conclusion: configuration.conclusion,
            })
          }
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
        })
    }
  }, [editor, preselectedLinkedProposalId])

  useEffect(() => {
    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          return Governance.get().createProposalGovernance({
            ...state.value,
            linked_proposal_id: state.value.linked_proposal_id!,
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
    }
  }, [editor, state.validated, state.value])

  if (accountState.loading) {
    return (
      <Container className="WelcomePage">
        <div>
          <Loader size="huge" active />
        </div>
      </Container>
    )
  }

  if (!account) {
    return (
      <LogIn
        title={t('page.submit_governance.title') || ''}
        description={t('page.submit_governance.description') || ''}
      />
    )
  }

  return (
    <ContentLayout small>
      <Head
        title={t('page.submit_governance.title') || ''}
        description={t('page.submit_governance.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_governance.title') || ''} />

      <ContentSection>
        <Header size="huge">{t('page.submit_governance.title')}</Header>
      </ContentSection>
      <ContentSection className="MarkdownSection--tiny">
        <Markdown>{t('page.submit_governance.description')}</Markdown>
      </ContentSection>

      <ContentSection>
        <Label>{t('page.submit_governance.linked_proposal_label')}</Label>
        <SelectField
          value={state.value.linked_proposal_id || undefined}
          placeholder={t('page.submit_governance.linked_proposal_placeholder') || undefined}
          onChange={(_, { value }) => editor.set({ linked_proposal_id: String(value) })}
          options={preselectedProposal}
          error={!!state.error.linked_proposal_id}
          message={t(state.error.linked_proposal_id)}
          disabled={true}
          loading={isLoadingVotingPower}
        />
      </ContentSection>

      <ContentSection>
        <Label>{t('page.submit_governance.title_label')}</Label>
        <Field
          value={state.value.title}
          placeholder={t('page.submit_governance.title_placeholder')}
          onChange={(_, { value }) => editor.set({ title: value })}
          onBlur={() => editor.set({ title: state.value.title.trim() })}
          error={!!state.error.title}
          message={
            t(state.error.title) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.title.length,
              limit: schema.title.maxLength,
            })
          }
          disabled={submissionVpNotMet || formDisabled}
          loading={isLoadingVotingPower}
        />
      </ContentSection>

      <ContentSection>
        <Label>
          {t('page.submit_governance.summary_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_governance.summary_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.summary}
          placeholder={t('page.submit_governance.summary_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ summary: value })}
          onBlur={() => editor.set({ summary: state.value.summary.trim() })}
          error={!!state.error.summary}
          message={
            t(state.error.summary) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.summary.length,
              limit: schema.summary.maxLength,
            })
          }
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>

      <ContentSection>
        <Label>
          {t('page.submit_governance.abstract_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_governance.abstract_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.abstract}
          placeholder={t('page.submit_governance.abstract_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ abstract: value })}
          onBlur={() => editor.set({ abstract: state.value.abstract.trim() })}
          error={!!state.error.abstract}
          message={
            t(state.error.abstract) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.abstract.length,
              limit: schema.abstract.maxLength,
            })
          }
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>

      <ContentSection>
        <Label>
          {t('page.submit_governance.motivation_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_governance.motivation_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.motivation}
          placeholder={t('page.submit_governance.motivation_placeholder')}
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
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>

      <ContentSection>
        <Label>
          {t('page.submit_governance.specification_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_governance.specification_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.specification}
          placeholder={t('page.submit_governance.specification_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ specification: value })}
          onBlur={() => editor.set({ specification: state.value.specification.trim() })}
          error={!!state.error.specification}
          message={
            t(state.error.specification) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.specification.length,
              limit: schema.specification.maxLength,
            })
          }
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>

      <ContentSection>
        <Label>
          {t('page.submit_governance.impacts_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_governance.impacts_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.impacts}
          placeholder={t('page.submit_governance.impacts_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ impacts: value })}
          onBlur={() => editor.set({ impacts: state.value.impacts.trim() })}
          error={!!state.error.impacts}
          message={
            t(state.error.impacts) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.impacts.length,
              limit: schema.impacts.maxLength,
            })
          }
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>

      <ContentSection>
        <Label>
          {t('page.submit_governance.implementation_pathways_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_governance.implementation_pathways_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.implementation_pathways}
          placeholder={t('page.submit_governance.implementation_pathways_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ implementation_pathways: value })}
          onBlur={() => editor.set({ implementation_pathways: state.value.implementation_pathways.trim() })}
          error={!!state.error.implementation_pathways}
          message={
            t(state.error.implementation_pathways) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.implementation_pathways.length,
              limit: schema.implementation_pathways.maxLength,
            })
          }
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>

      <ContentSection>
        <Label>
          {t('page.submit_governance.conclusion_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_governance.conclusion_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.conclusion}
          placeholder={t('page.submit_governance.conclusion_placeholder')}
          onChange={(_: unknown, { value }: { value: string }) => editor.set({ conclusion: value })}
          onBlur={() => editor.set({ conclusion: state.value.conclusion.trim() })}
          error={!!state.error.conclusion}
          message={
            t(state.error.conclusion) +
            ' ' +
            t('page.submit.character_counter', {
              current: state.value.conclusion.length,
              limit: schema.specification.maxLength,
            })
          }
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>

      <ContentSection>
        <Button
          primary
          disabled={state.validated || submissionVpNotMet}
          loading={state.validated || isLoadingVotingPower}
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
      {submissionVpNotMet && (
        <ContentSection>
          <Paragraph small primary>
            {t('error.governance.submission_vp_not_met')}
          </Paragraph>
        </ContentSection>
      )}
    </ContentLayout>
  )
}
