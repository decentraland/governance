import { useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import { useLocation } from '@reach/router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'
import snakeCase from 'lodash/snakeCase'

import { Governance } from '../../clients/Governance'
import Label from '../../components/Common/Typography/Label'
import Text from '../../components/Common/Typography/Text'
import MarkdownField from '../../components/Form/MarkdownFieldSection'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import { EditUpdateModal } from '../../components/Modal/EditUpdateModal/EditUpdateModal'
import ProjectHealthButton from '../../components/Updates/ProjectHealthButton'
import UpdateMarkdownView from '../../components/Updates/UpdateMarkdownView'
import { ProjectHealth, UpdateStatus } from '../../entities/Updates/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposalUpdate from '../../hooks/useProposalUpdate'
import locations, { navigate } from '../../utils/locations'

import './submit.css'
import './update.css'

type UpdateFormState = {
  health: ProjectHealth
  introduction: string
  highlights: string
  blockers: string
  nextSteps: string
  additionalNotes: string
}

const initialState: UpdateFormState = {
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

interface Props {
  isEdit?: boolean
}

const NOW = new Date()

export default function Update({ isEdit }: Props) {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()

  const {
    handleSubmit,
    formState: { isDirty, errors, isSubmitting },
    control,
    setValue,
    watch,
  } = useForm<UpdateFormState>({ defaultValues: initialState, mode: 'onTouched' })

  const [formDisabled, setFormDisabled] = useState(false)
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id') || ''
  const [isPreviewMode, setPreviewMode] = useState(false)
  const { update, isLoadingUpdate, isErrorOnUpdate, refetchUpdate } = useProposalUpdate(updateId)
  const proposalId = useMemo(() => params.get('proposalId') || update?.proposal_id || '', [update, params])
  const [error, setError] = useState('')
  const preventNavigation = useRef(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [projectHealth, setProjectHealth] = useState(initialState.health)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  useEffect(() => {
    if (isEdit && !!update) {
      const { health, introduction, highlights, blockers, next_steps, additional_notes } = update
      if (!!health && !!introduction && !!highlights && !!blockers && !!next_steps) {
        setValue('health', health)
        setValue('introduction', introduction)
        setValue('highlights', highlights)
        setValue('blockers', blockers)
        setValue('nextSteps', next_steps)
        setValue('additionalNotes', additional_notes || '')
      } else {
        console.error('Update is missing required fields', JSON.stringify(update))
      }
    }
  }, [isEdit, update, setValue])

  const getFieldProps = (
    fieldName: 'introduction' | 'highlights' | 'blockers' | 'nextSteps' | 'additionalNotes',
    isRequired = true
  ) => ({
    control,
    name: fieldName,
    error: !!errors[fieldName],
    rules: {
      ...(isRequired && {
        required: { value: true, message: t(`error.proposal_update.${snakeCase(fieldName)}_empty`) },
      }),
      minLength: {
        value: schema[fieldName].minLength,
        message: t(`error.proposal_update.${snakeCase(fieldName)}_too_short`),
      },
      maxLength: {
        value: schema[fieldName].maxLength,
        message: t(`error.proposal_update.${snakeCase(fieldName)}_too_large`),
      },
    },
    message:
      t(errors[fieldName]?.message || '') +
      ' ' +
      t('page.submit.character_counter', {
        current: watch(fieldName).length,
        limit: schema[fieldName].maxLength,
      }),
  })

  const values = useWatch({ control })

  const previewUpdate = useMemo(
    () => ({
      health: values.health,
      introduction: values.introduction,
      highlights: values.highlights,
      blockers: values.blockers,
      next_steps: values.nextSteps,
      additional_notes: values.additionalNotes,
      status: UpdateStatus.Pending,
      created_at: NOW,
      updated_at: NOW,
    }),
    [values]
  )

  const submitUpdate = async (data: UpdateFormState) => {
    if (!proposalId) {
      return
    }

    setFormDisabled(true)

    const newUpdate = {
      proposal_id: proposalId,
      author: account!,
      id: updateId,
      health: data.health,
      introduction: data.introduction,
      highlights: data.highlights,
      blockers: data.blockers,
      next_steps: data.nextSteps,
      additional_notes: data.additionalNotes,
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
        setError(err.message)
        setFormDisabled(false)
      }
    }
  }

  const onSubmit: SubmitHandler<UpdateFormState> = (data) => {
    if (isEdit) {
      setIsEditModalOpen(true)
    } else {
      submitUpdate(data)
    }
  }

  if (accountState.loading || (updateId && isLoadingUpdate)) {
    return <LoadingView />
  }

  const isDisabled =
    !isEdit &&
    updateId &&
    (isErrorOnUpdate || update?.status === UpdateStatus.Late || update?.status === UpdateStatus.Done)

  const isUserEnabledToEdit = update?.author === account

  if (isDisabled || (isEdit && !isUserEnabledToEdit)) {
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

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setFormDisabled(false)
  }

  const handleHealthChange = (value: ProjectHealth) => {
    setValue('health', value)
    setProjectHealth(value)
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
      <form onSubmit={handleSubmit(onSubmit)}>
        {!isPreviewMode && (
          <>
            <ContentSection>
              <Label>{t('page.proposal_update.health_label')}</Label>
              <div className="UpdateSubmit__ProjectHealthContainer">
                <ProjectHealthButton
                  type={ProjectHealth.OnTrack}
                  selectedValue={projectHealth}
                  onClick={handleHealthChange}
                  disabled={formDisabled}
                >
                  {t('page.proposal_update.on_track_label') || ''}
                </ProjectHealthButton>
                <ProjectHealthButton
                  type={ProjectHealth.AtRisk}
                  selectedValue={projectHealth}
                  onClick={handleHealthChange}
                  disabled={formDisabled}
                >
                  {t('page.proposal_update.at_risk_label') || ''}
                </ProjectHealthButton>
                <ProjectHealthButton
                  type={ProjectHealth.OffTrack}
                  selectedValue={projectHealth}
                  onClick={handleHealthChange}
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
              {...getFieldProps('additionalNotes', false)}
            />
          </>
        )}
        {isPreviewMode && <UpdateMarkdownView update={previewUpdate} />}
        <ContentSection className="UpdateSubmit__Actions">
          <Button type="submit" primary disabled={formDisabled} loading={isSubmitting}>
            {t('page.proposal_update.publish_update')}
          </Button>
          <Button
            basic
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault()
              setPreviewMode((prev) => !prev)
            }}
          >
            {isPreviewMode ? t('page.proposal_update.edit_update') : t('page.proposal_update.preview_update')}
          </Button>
        </ContentSection>
        {error && (
          <ContentSection>
            <Text size="lg" color="primary">
              {t(error) || error}
            </Text>
          </ContentSection>
        )}
      </form>
      {isEdit && (
        <EditUpdateModal
          loading={isSubmitting}
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          onClickAccept={() => submitUpdate(values as UpdateFormState)}
        />
      )}
    </ContentLayout>
  )
}
