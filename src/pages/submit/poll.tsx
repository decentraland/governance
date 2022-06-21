import React, { useEffect, useMemo, useState } from 'react'
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
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import omit from 'lodash.omit'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'

import { Governance } from '../../api/Governance'
import ErrorMessage from '../../components/Error/ErrorMessage'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { INVALID_PROPOSAL_POLL_OPTIONS, newProposalPollScheme } from '../../entities/Proposal/types'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './poll.css'
import './submit.css'

type PollState = {
  title: string
  description: string
  choices: Record<string, string>
}

const schema = newProposalPollScheme.properties

const initialPollState: PollState = {
  title: '',
  description: '',
  choices: {
    '0': '',
    '1': '',
  },
}

const edit = (state: PollState, props: Partial<PollState>) => {
  return {
    ...state,
    ...props,
  }
}

const validate = createValidator<PollState>({
  title: (state) => ({
    title: assert(state.title.length <= schema.title.maxLength, 'error.poll.title_too_large'),
  }),
  description: (state) => ({
    description: assert(state.description.length <= schema.description.maxLength, 'error.poll.description_too_large'),
  }),
  '*': (state) => {
    const choices = Object.values(state.choices)
    return {
      title:
        assert(state.title.length > 0, 'error.poll.title_empty') ||
        assert(state.title.length >= schema.title.minLength, 'error.poll.title_too_short') ||
        assert(state.title.length <= schema.title.maxLength, 'error.poll.title_too_large'),
      description:
        assert(state.description.length > 0, 'error.poll.description_empty') ||
        assert(state.description.length >= schema.description.minLength, 'error.poll.description_too_short') ||
        assert(state.description.length <= schema.description.maxLength, 'error.poll.description_too_large'),
      choices:
        assert(choices.length >= schema.choices.minItems, 'error.poll.choices_insufficient') ||
        assert(
          choices.every((option) => option !== ''),
          'error.poll.choices_empty'
        ) ||
        assert(
          choices.every((option) => option.length >= schema.choices.items.minLength),
          'error.poll.choices_too_short'
        ) ||
        assert(
          choices.every((option) => option.length <= schema.choices.items.maxLength),
          'error.poll.choices_too_long'
        ),
    }
  },
})

export default function SubmitPoll() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialPollState)
  const { votingPower, isLoadingVotingPower } = useVotingPowerBalance(account)
  const submissionVpNotMet = useMemo(
    () => votingPower < Number(process.env.GATSBY_SUBMISSION_THRESHOLD_POLL),
    [votingPower]
  )
  const [formDisabled, setFormDisabled] = useState(false)

  function handleAddOption() {
    editor.set({
      ...state.value,
      choices: {
        ...state.value.choices,
        [Date.now()]: '',
      },
    })
  }

  function handleRemoveOption(i: string) {
    const choices = omit(state.value.choices, [i]) as Record<string, string>
    if (Object.keys(choices).length < 2) {
      choices[Date.now()] = ''
    }

    editor.set({
      ...state.value,
      choices,
    })
  }

  function handleEditOption(i: string, value: string) {
    editor.set({
      ...state.value,
      choices: {
        ...state.value.choices,
        [i]: value,
      },
    })
  }

  useEffect(() => {
    if (state.validated) {
      const choices = Object.keys(state.value.choices)
        .sort()
        .map((key) => state.value.choices[key])
      setFormDisabled(true)
      Governance.get()
        .createProposalPoll({
          ...state.value,
          choices,
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
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={t('page.submit_poll.title') || ''} description={t('page.submit_poll.description') || ''} />
  }

  return (
    <ContentLayout small>
      <Head
        title={t('page.submit_poll.title') || ''}
        description={t('page.submit_poll.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_poll.title') || ''} />

      <ContentSection>
        <Header size="huge">{t('page.submit_poll.title')}</Header>
      </ContentSection>
      <ContentSection className="MarkdownSection--tiny">
        <Markdown>{t('page.submit_poll.description')}</Markdown>
      </ContentSection>

      <ContentSection>
        <Label>{t('page.submit_poll.title_label')}</Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_poll.title_detail')}
        </Paragraph>
        <Field
          value={state.value.title}
          placeholder={t('page.submit_poll.title_placeholder') || ''}
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
          loading={isLoadingVotingPower}
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>
          {t('page.submit_poll.description_label')}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {t('page.submit_poll.description_detail')}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          placeholder={t('page.submit_poll.description_placeholder') || ''}
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
          disabled={submissionVpNotMet || formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>{t('page.submit_poll.choices_label')}</Label>
        <Paragraph tiny secondary className="details">
          {' '}
        </Paragraph>
        <Paragraph small primary>
          {t(state.error.choices)}
        </Paragraph>
        <div className="Poll__Options">
          {Object.keys(state.value.choices)
            .sort()
            .map((key, i) => (
              <Field
                key={key}
                placeholder={'choice ' + String(i + 1)}
                value={state.value.choices[key]}
                action={<Icon name="x" />}
                onAction={() => handleRemoveOption(key)}
                onChange={(_, { value }) => handleEditOption(key, value)}
                disabled={submissionVpNotMet || formDisabled}
              />
            ))}
          <Field
            readOnly
            value={INVALID_PROPOSAL_POLL_OPTIONS}
            className="input--disabled"
            action={
              <Popup
                content={t('page.submit_poll.mandatory_option')}
                position="top center"
                trigger={<Icon name="x" />}
                on="hover"
              />
            }
            onAction={() => null}
          />
          <Button basic fluid onClick={handleAddOption}>
            {t('page.submit_poll.choices_add')}
          </Button>
        </div>
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
      {submissionVpNotMet && (
        <ContentSection>
          <Paragraph small primary>
            {t('error.poll.submission_vp_not_met')}
          </Paragraph>
        </ContentSection>
      )}
      {state.error['*'] && (
        <ContentSection>
          <ErrorMessage label={t('page.submit.error_label')} errorMessage={t(state.error['*']) || state.error['*']} />
        </ContentSection>
      )}
    </ContentLayout>
  )
}
