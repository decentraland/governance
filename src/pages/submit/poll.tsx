import React, { useEffect } from 'react'
import Helmet from 'react-helmet'
import omit from 'lodash.omit'
import { navigate } from 'gatsby-plugin-intl'
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Field } from "decentraland-ui/dist/components/Field/Field"
import { newProposalPollScheme } from '../../entities/Proposal/types'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { Governance } from '../../api/Governance'
import locations from '../../modules/locations'
import loader from '../../modules/loader'
import './submit.css'

type PollState = {
  title: string,
  description: string,
  options: Record<string, string>
}

const schema = newProposalPollScheme.properties

const initialPollState: PollState = {
  title: '',
  description: '',
  options: {
    '0': '',
    '1': ''
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
    title: assert(state.title.length <= schema.title.maxLength, 'error.poll.title_too_large')
  }),
  description: (state) => ({
    description: assert(state.description.length <= schema.description.maxLength, 'error.poll.description_too_large')
  }),
  '*': (state) => {
    const options = Object.values(state.options)
    return ({
      title: (
        assert(state.title.length > 0, 'error.poll.title_empty') ||
        assert(state.title.length >= schema.title.minLength, 'error.poll.title_too_short') ||
        assert(state.title.length <= schema.title.maxLength, 'error.poll.title_too_large')
      ),
      description: (
        assert(state.description.length > 0, 'error.poll.description_empty') ||
        assert(state.description.length >= schema.description.minLength, 'error.poll.description_too_short') ||
        assert(state.description.length <= schema.description.maxLength, 'error.poll.description_too_large')
      ),
      options: (
        assert(options.length >= schema.options.minItems, `error.poll.options_insufficient`) ||
        assert(options.some(option => option !== ''), `error.poll.options_empty`) ||
        assert(options.some(option => option.length >= schema.options.items.minLength), `error.poll.options_too_short`)
      ),
    })
  }
})

export default function SubmitPoll() {
  const l = useFormatMessage()
  const [ state, editor ] = useEditor(edit, validate, initialPollState)

  function handleAddOption() {
    editor.set({
      ...state.value,
      options: {
        ...state.value.options,
        [Date.now()]: ''
      }
    })
  }

  function handleRemoveOption(i: string) {
    const options = omit(state.value.options, [ i ]) as Record<string, string>
    if (Object.keys(options).length < 2) {
      options[Date.now()] = ''
    }

    editor.set({
      ...state.value,
      options,
    })
  }

  function handleEditOption(i: string, value: string) {
    editor.set({
      ...state.value,
      options: {
        ...state.value.options,
        [i]: value
      },
    })
  }

  useEffect(() => {
    if (state.validated) {
      const options = Object
        .keys(state.value.options)
        .sort()
        .map(key => state.value.options[key])

      Governance.get()
        .createProposalPoll({
          ...state.value,
          options
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
  }, [ state.validated ])

  return <ContentLayout small>
    <Helmet title={l('page.submit_poll.title') || ''}  />
    <ContentSection>
      <Header size="huge">{l('page.submit_poll.title')}</Header>
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_poll.title_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_poll.title_detail')}</Paragraph>
      <Field
        value={state.value.title}
        placeholder={l('page.submit_poll.title_placeholder') || ''}
        onChange={(_, { value }) => editor.set({ title: value })}
        onBlur={() => editor.set({ title: state.value.title.trim() })}
        error={!!state.error.title}
        message={
          l.optional(state.error.title) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.title.length,
            limit: schema.title.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_poll.description_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_poll.description_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        placeholder={l('page.submit_poll.description_placeholder') || ''}
        value={state.value.description}
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
      <Label>{l('page.submit_poll.options_label')}</Label>
      <Paragraph tiny secondary className="details">{' '}</Paragraph>
      <Paragraph small primary>{l.optional(state.error.options)}</Paragraph>
      <div style={{ width: '90%', maxWidth: '300px', margin: '0 5%' }}>
        {Object.keys(state.value.options).sort().map((key, i) => <Field
          key={key}
          placeholder={'option ' + String(i + 1)}
          value={state.value.options[key]}
          action={<Icon name="x" />}
          onAction={() => handleRemoveOption(key)}
          onChange={(_, { value }) => handleEditOption(key, value)}
        />)}
        <Button basic style={{ width: '100%' }} onClick={handleAddOption}>{l('page.submit_poll.options_add')}</Button>
      </div>
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
