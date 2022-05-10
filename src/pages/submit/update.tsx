import React, { useEffect, useMemo, useState } from 'react'
import Helmet from 'react-helmet'

import { useLocation } from '@gatsbyjs/reach-router'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'

import { Governance } from '../../api/Governance'
import MarkdownField from '../../components/Form/MarkdownField'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import ProjectHealthButton from '../../components/Updates/ProjectHealthButton'
import UpdateMarkdownView from '../../components/Updates/UpdateMarkdownView'
import { ProjectHealth, UpdateStatus } from '../../entities/Updates/types'
import useProposalUpdate from '../../hooks/useProposalUpdate'
import locations from '../../modules/locations'

import './submit.css'
import './update.css'

type updateFormState = {
  health: ProjectHealth
  introduction: string
  highlights: string
  blockers: string
  nextSteps: string
  additionalNotes: string
}

const initialState: updateFormState = {
  health: ProjectHealth.OnTrack,
  introduction: '',
  highlights: '',
  blockers: '',
  nextSteps: '',
  additionalNotes: '',
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
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialState)
  const [formDisabled, setFormDisabled] = useState(false)
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const proposalId = params.get('proposalId') || ''
  const updateId = params.get('id') || ''
  const [isPreviewMode, setPreviewMode] = useState(false)
  const [projectHealth, setProjectHealth] = useState(initialState.health)
  const { update, state: updateState } = useProposalUpdate(updateId)

  const getFieldProps = (fieldName: 'introduction' | 'highlights' | 'blockers' | 'nextSteps' | 'additionalNotes') => ({
    value: state.value[fieldName],
    onChange: (_: any, { value }: any) => editor.set({ [fieldName]: value }),
    onBlur: () => editor.set({ [fieldName]: state.value[fieldName].trim() }),
    error: !!state.error[fieldName],
    message:
      t(state.error[fieldName]) +
      ' ' +
      t('page.submit.character_counter', {
        current: state.value[fieldName].length,
        limit: schema[fieldName].maxLength,
      }),
  })

  const previewUpdate = {
    health: projectHealth,
    introduction: state.value.introduction,
    highlights: state.value.highlights,
    blockers: state.value.blockers,
    next_steps: state.value.nextSteps,
    additional_notes: state.value.additionalNotes,
    status: UpdateStatus.Pending,
  }

  useEffect(() => {
    const submitUpdate = async () => {
      if (!proposalId) {
        return
      }

      setFormDisabled(true)

      const newUpdate = {
        proposal_id: proposalId,
        id: updateId,
        health: projectHealth,
        introduction: state.value.introduction,
        highlights: state.value.highlights,
        blockers: state.value.blockers,
        next_steps: state.value.nextSteps,
        additional_notes: state.value.additionalNotes,
        status: UpdateStatus.Pending,
      }

      try {
        if (updateId) {
          await Governance.get().updateProposalUpdate(newUpdate)
        } else {
          await Governance.get().createProposalUpdate(newUpdate)
        }
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

  if (accountState.loading || updateState.loading) {
    return (
      <Container className="WelcomePage">
        <div>
          <Loader size="huge" active />
        </div>
      </Container>
    )
  }

  if (updateId && (updateState.error || update?.status === UpdateStatus.Late || update?.status === UpdateStatus.Done)) {
    return (
      <ContentLayout>
        <NotFound />
      </ContentLayout>
    )
  }

  if (!account) {
    return (
      <Container>
        <Head
          title={t('page.proposal_update.title') || ''}
          description={t('page.proposal_update.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
      </Container>
    )
  }

  return (
    <ContentLayout small>
      <Head
        title={t('page.proposal_update.title') || ''}
        description={t('page.proposal_update.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title="Publish Update" />
      <ContentSection>
        <Header size="huge">{t('page.proposal_update.title')}</Header>
      </ContentSection>
      <ContentSection>
        <Paragraph small>{t('page.proposal_update.description')}</Paragraph>
      </ContentSection>
      {!isPreviewMode && (
        <>
          <ContentSection>
            <Label>{t('page.proposal_update.health_label')}</Label>
            <div className="UpdateSubmit__ProjectHealthContainer">
              <ProjectHealthButton
                type={ProjectHealth.OnTrack}
                selectedValue={projectHealth}
                onClick={setProjectHealth}
                disabled={formDisabled}
              >
                {t('page.proposal_update.on_track_label') || ''}
              </ProjectHealthButton>
              <ProjectHealthButton
                type={ProjectHealth.AtRisk}
                selectedValue={projectHealth}
                onClick={setProjectHealth}
                disabled={formDisabled}
              >
                {t('page.proposal_update.at_risk_label') || ''}
              </ProjectHealthButton>
              <ProjectHealthButton
                type={ProjectHealth.OffTrack}
                selectedValue={projectHealth}
                onClick={setProjectHealth}
                disabled={formDisabled}
              >
                {t('page.proposal_update.off_track_label') || ''}
              </ProjectHealthButton>
            </div>
          </ContentSection>
          <MarkdownField
            showMarkdownNotice={false}
            label={t('page.proposal_update.introduction_label')}
            disabled={formDisabled}
            minHeight={77}
            {...getFieldProps('introduction')}
          />
          <MarkdownField
            showMarkdownNotice={false}
            label={t('page.proposal_update.highlights_label')}
            placeholder={t('page.proposal_update.highlights_placeholder')}
            disabled={formDisabled}
            {...getFieldProps('highlights')}
          />
          <MarkdownField
            showMarkdownNotice={false}
            label={t('page.proposal_update.blockers_label')}
            placeholder={t('page.proposal_update.blockers_placeholder')}
            disabled={formDisabled}
            {...getFieldProps('blockers')}
          />
          <MarkdownField
            showMarkdownNotice={false}
            label={t('page.proposal_update.next_steps_label')}
            placeholder={t('page.proposal_update.next_steps_placeholder')}
            disabled={formDisabled}
            {...getFieldProps('nextSteps')}
          />
          <MarkdownField
            showMarkdownNotice={false}
            label={t('page.proposal_update.additional_notes_label')}
            placeholder={t('page.proposal_update.additional_notes_placeholder')}
            disabled={formDisabled}
            {...getFieldProps('additionalNotes')}
          />
        </>
      )}
      {isPreviewMode && <UpdateMarkdownView update={previewUpdate} />}
      <ContentSection className="UpdateSubmit__Actions">
        <Button primary disabled={state.validated} loading={state.validated} onClick={() => editor.validate()}>
          {t('page.proposal_update.publish_update')}
        </Button>
        <Button basic disabled={state.validated} onClick={() => setPreviewMode((prev) => !prev)}>
          {isPreviewMode ? t('page.proposal_update.edit_update') : t('page.proposal_update.preview_update')}
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
