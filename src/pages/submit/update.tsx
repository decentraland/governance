import React, { useEffect, useMemo, useState } from 'react'
import Helmet from 'react-helmet'

import { useLocation } from '@reach/router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'

import { Governance } from '../../clients/Governance'
import Label from '../../components/Common/Label'
import Text from '../../components/Common/Text/Text'
import MarkdownField from '../../components/Form/MarkdownField'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import { EditUpdateModal } from '../../components/Modal/EditUpdateModal/EditUpdateModal'
import ProjectHealthButton from '../../components/Updates/ProjectHealthButton'
import UpdateMarkdownView from '../../components/Updates/UpdateMarkdownView'
import { ProjectHealth, UpdateStatus } from '../../entities/Updates/types'
import useProposalUpdate from '../../hooks/useProposalUpdate'
import locations from '../../utils/locations'

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

interface Props {
  isEdit?: boolean
}

const NOW = new Date()

export default function Update({ isEdit }: Props) {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialState)
  const [formDisabled, setFormDisabled] = useState(false)
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id') || ''
  const [isPreviewMode, setPreviewMode] = useState(false)
  const [projectHealth, setProjectHealth] = useState(initialState.health)
  const { update, isLoadingUpdate, isErrorOnUpdate, refetchUpdate } = useProposalUpdate(updateId)
  const proposalId = useMemo(() => params.get('proposalId') || update?.proposal_id || '', [update])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditAccepted, setIsEditAccepted] = useState(false)

  useEffect(() => {
    if (isEdit && !!update) {
      const { health, introduction, highlights, blockers, next_steps, additional_notes } = update
      if (health && introduction && highlights && blockers && next_steps) {
        setProjectHealth(health)
        editor.set({ introduction, highlights, blockers, nextSteps: next_steps, additionalNotes: additional_notes })
      } else {
        console.error('Update is missing required fields', JSON.stringify(update))
      }
    }
  }, [isEdit, update])

  const getFieldProps = (fieldName: 'introduction' | 'highlights' | 'blockers' | 'nextSteps' | 'additionalNotes') => ({
    value: state.value[fieldName],
    onChange: (_: unknown, { value }: { value: string }) => editor.set({ [fieldName]: value }),
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
    created_at: NOW,
    updated_at: NOW,
  }

  useEffect(() => {
    const submitUpdate = async () => {
      if (!proposalId) {
        console.log('No proposal ID')
        return
      }

      setFormDisabled(true)

      const newUpdate = {
        proposal_id: proposalId,
        author: account!,
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
          if (isEdit) {
            setIsEditModalOpen(false)
          }
        } else {
          await Governance.get().createProposalUpdate(newUpdate)
        }
        await refetchUpdate()
        navigate(locations.proposal(proposalId, { newUpdate: 'true' }), { replace: true })
      } catch (err) {
        if (err instanceof Error) {
          editor.error({ '*': err.message })
          setFormDisabled(false)
        }
      }
    }

    if (state.validated) {
      if (isEdit && !isEditAccepted) {
        setIsEditModalOpen(true)
      } else {
        submitUpdate()
      }
    }
  }, [state.validated, isEdit, isEditAccepted])

  if (accountState.loading || isLoadingUpdate) {
    return <LoadingView />
  }

  const isDisabled =
    !isEdit &&
    updateId &&
    (isErrorOnUpdate || update?.status === UpdateStatus.Late || update?.status === UpdateStatus.Done)

  const isUserEnabledToEdit = update?.author === account

  if (isDisabled || (isEdit && !isUserEnabledToEdit)) {
    console.log('isDisabled', isDisabled, 'isEdit', isEdit, 'isUserEnabledToEdit', isUserEnabledToEdit)

    return (
      <ContentLayout>
        <NotFound />
      </ContentLayout>
    )
  }

  const title = t('page.proposal_update.title')
  const description = t('page.proposal_update.description')

  if (!account) {
    return (
      <Container>
        <Head title={title} description={description} image="https://decentraland.org/images/decentraland.png" />
        <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
      </Container>
    )
  }

  const isLoading = isEdit ? isEditAccepted && state.validated : state.validated
  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setFormDisabled(false)
  }

  return (
    <ContentLayout small>
      <Head title={title} description={description} image="https://decentraland.org/images/decentraland.png" />
      <Helmet title="Publish Update" />
      <ContentSection>
        <Header size="huge">{title}</Header>
      </ContentSection>
      <ContentSection>
        <Text size="lg">{description}</Text>
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
        <Button primary disabled={isLoading} loading={isLoading} onClick={() => editor.validate()}>
          {t('page.proposal_update.publish_update')}
        </Button>
        <Button basic disabled={isLoading} onClick={() => setPreviewMode((prev) => !prev)}>
          {isPreviewMode ? t('page.proposal_update.edit_update') : t('page.proposal_update.preview_update')}
        </Button>
      </ContentSection>
      {state.error['*'] && (
        <ContentSection>
          <Text size="lg" color="primary">
            {t(state.error['*']) || state.error['*']}
          </Text>
        </ContentSection>
      )}
      {isEdit && (
        <EditUpdateModal
          onClickAccept={() => setIsEditAccepted(true)}
          open={isEditModalOpen}
          onClose={handleEditModalClose}
        />
      )}
    </ContentLayout>
  )
}
