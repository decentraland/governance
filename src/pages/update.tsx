import React, { useEffect, useMemo, useState } from 'react'
import Helmet from 'react-helmet'
import { useLocation } from '@reach/router'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { navigate } from 'gatsby-plugin-intl'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import MarkdownNotice from '../components/Form/MarkdownNotice'
import { Governance } from '../api/Governance'
import locations from '../modules/locations'
import './submit/submit.css'

type updateFormState = {
  title: string
  description: string
}

const initialState: updateFormState = {
  title: '',
  description: '',
}

const updateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description'],
  properties: {
    title: {
      type: 'string',
      minLength: 10,
      maxLength: 100,
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
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

const validate = createValidator<updateFormState>({
  title: (state) => ({
    title: assert(state.title.length > 0, 'error.proposal_update.description_empty'),
  }),
  description: (state) => ({
    description: assert(state.description.length > 0, 'error.proposal_update.description_empty'),
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

  useEffect(() => {
    const submitUpdate = async () => {
      if (!proposalId || !updateId) {
        return
      }

      setFormDisabled(true)

      const newUpdate = {
        proposal_id: proposalId,
        id: updateId,
        title: state.value.title,
        description: state.value.description,
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
      <ContentSection>
        <Label>{l('page.proposal_update.title_label')}</Label>
        <Field
          placeholder={l('page.proposal_update.title_placeholder')}
          value={state.value.title}
          onChange={(_, { value }) => editor.set({ title: value })}
          onBlur={() => editor.set({ title: state.value.title.trim() })}
          error={!!state.error.title}
          message={
            l.optional(state.error.title) +
            ' ' +
            l('page.submit.character_counter', {
              current: state.value.title.length,
              limit: schema.title.maxLength,
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>
          {l('page.proposal_update.description_label')}
          <MarkdownNotice />
        </Label>
        <MarkdownTextarea
          placeholder={l('page.proposal_update.description_placeholder')}
          minHeight={175}
          value={state.value.description}
          onChange={(_: any, { value }: any) => editor.set({ description: value })}
          onBlur={() => editor.set({ description: state.value.description.trim() })}
          error={!!state.error.description}
          message={
            l.optional(state.error.description) +
            ' ' +
            l('page.submit.character_counter', {
              current: state.value.description.length,
              limit: schema.description.maxLength,
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
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
