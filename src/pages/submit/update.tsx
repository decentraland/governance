import React, { useEffect, useMemo, useState } from 'react'
import Helmet from 'react-helmet'
import { useLocation } from '@reach/router'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { navigate } from 'gatsby-plugin-intl'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { Governance } from '../../api/Governance'
import locations from '../../modules/locations'
import MarkdownField from '../../components/Form/MarkdownField'
import { ProjectHealth } from '../../entities/Updates/types'
import './submit.css'

type updateFormState = {
  health: ProjectHealth
  introduction: string
  highlights: string
  blockers: string
  nextSteps: string
  additionalNotes: string
  lastUpdate: boolean
}

const initialState: updateFormState = {
  health: ProjectHealth.OnTrack,
  introduction: '',
  highlights: '',
  blockers: '',
  nextSteps: '',
  additionalNotes: '',
  lastUpdate: false,
}

const updateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['health', 'introduction', 'highlights', 'blockers', 'nextSteps'],
  properties: {
    health: {
      type: 'string',
    },
    introduction: {
      type: 'string',
      minLength: 1,
      maxLength: 500,
    },
    highlights: {
      type: 'string',
      minLength: 1,
      maxLength: 3500,
    },
    blockers: {
      type: 'string',
      minLength: 1,
      maxLength: 3500,
    },
    nextSteps: {
      type: 'string',
      minLength: 1,
      maxLength: 3500,
    },
    additionalNotes: {
      type: 'string',
      minLength: 1,
      maxLength: 3500,
    },
  },
}

const schema = updateSchema.properties

const edit = (state: updateFormState, props: Partial<updateFormState>) => {
  return {
    ...state,
    ...props,
  }
}

// TODO: Check max length
const validate = createValidator<updateFormState>({
  health: (state) => ({
    health: assert(!!state.health, 'error.proposal_update.description_empty'),
  }),
  introduction: (state) => ({
    introduction:
      assert(state.introduction.length > 0, 'error.proposal_update.introduction_empty') ||
      assert(
        state.introduction.length <= schema.introduction.maxLength,
        'error.proposal_update.introduction_too_large'
      ),
  }),
  highlights: (state) => ({
    highlights:
      assert(state.highlights.length > 0, 'error.proposal_update.highlights_empty') ||
      assert(state.highlights.length <= schema.highlights.maxLength, 'error.proposal_update.highlights_too_large'),
  }),
  blockers: (state) => ({
    blockers:
      assert(state.blockers.length > 0, 'error.proposal_update.blockers_empty') ||
      assert(state.blockers.length <= schema.blockers.maxLength, 'error.proposal_update.blockers_too_large'),
  }),
  nextSteps: (state) => ({
    nextSteps:
      assert(state.nextSteps.length > 0, 'error.proposal_update.next_steps_empty') ||
      assert(state.nextSteps.length <= schema.nextSteps.maxLength, 'error.proposal_update.next_steps_too_large'),
  }),
  additionalNotes: (state) => ({
    additionalNotes: assert(
      state.additionalNotes.length <= schema.additionalNotes.maxLength,
      'error.proposal_update.additional_notes_too_large'
    ),
  }),
})

export default function Update() {
  const l = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialState)
  const [formDisabled, setFormDisabled] = useState(false)
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const proposalId = params.get('proposalId') || ''
  const updateId = params.get('id') || ''

  const getFieldProps = (fieldName: 'introduction' | 'highlights' | 'blockers' | 'nextSteps' | 'additionalNotes') => ({
    value: state.value[fieldName],
    onChange: (_: any, { value }: any) => editor.set({ [fieldName]: value }),
    onBlur: () => editor.set({ [fieldName]: state.value[fieldName].trim() }),
    error: !!state.error[fieldName],
    message:
      l.optional(state.error[fieldName]) +
      ' ' +
      l('page.submit.character_counter', {
        current: state.value[fieldName].length,
        limit: schema[fieldName].maxLength,
      }),
  })

  useEffect(() => {
    const submitUpdate = async () => {
      if (!proposalId || !updateId) {
        return
      }

      setFormDisabled(true)

      const newUpdate = {
        proposal_id: proposalId,
        id: updateId,
        health: state.value.health,
        introduction: state.value.introduction,
        highlights: state.value.highlights,
        blockers: state.value.blockers,
        next_steps: state.value.nextSteps,
        additional_notes: state.value.additionalNotes,
        last_update: state.value.lastUpdate,
      }

      try {
        await Governance.get().updateProposalUpdate(newUpdate)
        navigate(locations.proposal(proposalId, { newUpdate: 'true' }), { replace: true })
      } catch (err) {
        if (err instanceof Error) {
          editor.error({ '*': err.message })
          setFormDisabled(false)
        }
      }
    }

    if (state.validated) {
      submitUpdate()
    }
  }, [state.validated])

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
      <Container>
        <Head
          title={l('page.proposal_update.title') || ''}
          description={l('page.proposal_update.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
      </Container>
    )
  }

  return (
    <ContentLayout small>
      <Head
        title={l('page.proposal_update.title') || ''}
        description={l('page.proposal_update.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title="Publish Update" />
      <ContentSection>
        <Header size="huge">{l('page.proposal_update.title')}</Header>
      </ContentSection>
      <ContentSection>
        <Paragraph small>{l('page.proposal_update.description')}</Paragraph>
      </ContentSection>
      <MarkdownField
        label={l('page.proposal_update.introduction_label')}
        disabled={formDisabled}
        minHeight={77}
        {...getFieldProps('introduction')}
      />
      <MarkdownField
        label={l('page.proposal_update.highlights_label')}
        placeholder={l('page.proposal_update.highlights_placeholder')}
        disabled={formDisabled}
        {...getFieldProps('highlights')}
      />
      <MarkdownField
        label={l('page.proposal_update.blockers_label')}
        placeholder={l('page.proposal_update.blockers_placeholder')}
        disabled={formDisabled}
        {...getFieldProps('blockers')}
      />
      <MarkdownField
        label={l('page.proposal_update.next_steps_label')}
        placeholder={l('page.proposal_update.next_steps_placeholder')}
        disabled={formDisabled}
        {...getFieldProps('nextSteps')}
      />
      <MarkdownField
        label={l('page.proposal_update.additional_notes_label')}
        placeholder={l('page.proposal_update.additional_notes_placeholder')}
        disabled={formDisabled}
        {...getFieldProps('additionalNotes')}
      />
      <ContentSection>
        <Button primary disabled={state.validated} loading={state.validated} onClick={() => editor.validate()}>
          {l('page.proposal_update.publish_update')}
        </Button>
      </ContentSection>
      {state.error['*'] && (
        <ContentSection>
          <Paragraph small primary>
            {l(state.error['*']) || state.error['*']}
          </Paragraph>
        </ContentSection>
      )}
    </ContentLayout>
  )
}
