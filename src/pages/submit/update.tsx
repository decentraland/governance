import { useCallback, useMemo, useState } from 'react'
import Helmet from 'react-helmet'
import { SubmitHandler } from 'react-hook-form'

import { useLocation } from '@reach/router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'

import { Governance } from '../../clients/Governance'
import Text from '../../components/Common/Typography/Text'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import { EditUpdateModal } from '../../components/Modal/EditUpdateModal/EditUpdateModal'
import FinancialSection from '../../components/Updates/FinancialSection'
import GeneralSection from '../../components/Updates/GeneralSection'
import UpdateMarkdownView from '../../components/Updates/UpdateMarkdownView'
import {
  UpdateAttributes,
  UpdateFinancial,
  UpdateGeneral,
  UpdateGeneralSchema,
  UpdateStatus,
} from '../../entities/Updates/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePreventNavigation from '../../hooks/usePreventNavigation'
import useProposalUpdate from '../../hooks/useProposalUpdate'
import locations, { navigate } from '../../utils/locations'

import './submit.css'
import './update.css'

interface Props {
  isEdit?: boolean
}

type UpdateValitationState = {
  generalSectionValid: boolean
  financialSectionValid: boolean
}

const NOW = new Date()

const intialValidationState: UpdateValitationState = {
  generalSectionValid: false,
  financialSectionValid: false,
}

const initialGeneralState: Partial<UpdateGeneral> | undefined = undefined
const initialFinancialState: UpdateFinancial | undefined = undefined

function getInitialUpdateValues<T>(
  update: UpdateAttributes | null | undefined,
  isKey: (value: string) => boolean
): Partial<T> | undefined {
  if (!update) {
    return undefined
  }
  const values: Partial<T> = {}
  for (const key of Object.keys(update)) {
    if (isKey(key)) {
      const value = update[key as keyof UpdateAttributes]
      if (value) {
        values[key as keyof T] = value as never
      }
    }
  }
  return Object.keys(values).length > 0 ? values : undefined
}

export default function Update({ isEdit }: Props) {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()

  const [formDisabled, setFormDisabled] = useState(false)
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id') || ''
  const [isPreviewMode, setPreviewMode] = useState(false)
  const { update, isLoadingUpdate, isErrorOnUpdate, refetchUpdate } = useProposalUpdate(updateId)
  const proposalId = useMemo(() => params.get('proposalId') || update?.proposal_id || '', [update, params])
  const [error, setError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [generalSection, patchGeneralSection] = useState(initialGeneralState)
  const [financialSection, patchFinancialSection] = useState(initialFinancialState)
  const [validationState, patchValidationState] = usePatchState<UpdateValitationState>(intialValidationState)
  const isValidToSubmit = Object.values(validationState).every((valid) => valid)

  usePreventNavigation(true)

  const handleGeneralSectionValidation = useCallback(
    (data: UpdateGeneral, sectionValid: boolean) => {
      patchGeneralSection((prevState) => ({ ...prevState, ...data }))
      patchValidationState({ generalSectionValid: sectionValid })
    },
    [patchGeneralSection, patchValidationState]
  )

  const handleFinancialSectionValidation = useCallback(
    (data: UpdateFinancial | undefined, sectionValid: boolean) => {
      if (data) {
        patchFinancialSection((prevState) => ({ ...prevState, ...data }))
      }
      patchValidationState({ financialSectionValid: sectionValid })
    },
    [patchFinancialSection, patchValidationState]
  )

  const previewUpdate = useMemo(
    () => ({
      ...generalSection,
      status: UpdateStatus.Pending,
      created_at: NOW,
      updated_at: NOW,
    }),
    [generalSection]
  )

  const submitUpdate = async (data: UpdateGeneral & UpdateFinancial) => {
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
      next_steps: data.next_steps,
      additional_notes: data.additional_notes,
      records: data.records,
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

  const onSubmit: SubmitHandler<UpdateGeneral & UpdateFinancial> = (data) => {
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
      <div>
        {!isPreviewMode && (
          <>
            <GeneralSection
              isFormDisabled={formDisabled}
              intialValues={
                generalSection || getInitialUpdateValues<UpdateGeneral>(update, (key) => key in UpdateGeneralSchema)
              }
              sectionNumber={1}
              onValidation={handleGeneralSectionValidation}
            />
            <FinancialSection
              isFormDisabled={formDisabled}
              sectionNumber={2}
              onValidation={handleFinancialSectionValidation}
              intialValues={
                financialSection ||
                getInitialUpdateValues<UpdateFinancial>(update, (key) => key in ({ records: [] } as UpdateFinancial))
              }
            />
          </>
        )}
        {isPreviewMode && <UpdateMarkdownView update={previewUpdate} />}
        <ContentSection className="UpdateSubmit__Actions">
          <Button
            primary
            disabled={formDisabled || !isValidToSubmit}
            loading={formDisabled}
            onClick={() => onSubmit({ ...generalSection, ...financialSection } as UpdateGeneral & UpdateFinancial)}
          >
            {t('page.proposal_update.publish_update')}
          </Button>
          <Button
            basic
            disabled={formDisabled}
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
      </div>
      {isEdit && (
        <EditUpdateModal
          loading={formDisabled}
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          onClickAccept={() =>
            submitUpdate({ ...generalSection, ...financialSection } as UpdateGeneral & UpdateFinancial)
          }
        />
      )}
    </ContentLayout>
  )
}
