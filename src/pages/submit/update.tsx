import { useCallback, useMemo, useState } from 'react'
import { SubmitHandler } from 'react-hook-form'

import { useLocation } from '@reach/router'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { DappsFeatureFlags } from 'decentraland-gatsby/dist/context/FeatureFlag/types'
import useFeatureFlagContext from 'decentraland-gatsby/dist/context/FeatureFlag/useFeatureFlagContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'

import { Governance } from '../../clients/Governance'
import Text from '../../components/Common/Typography/Text'
import ContentLayout from '../../components/Layout/ContentLayout'
import ContentSection from '../../components/Layout/ContentSection'
import Head from '../../components/Layout/Head'
import LoadingView from '../../components/Layout/LoadingView'
import NotFound from '../../components/Layout/NotFound'
import { EditUpdateModal } from '../../components/Modal/EditUpdateModal/EditUpdateModal'
import FinancialSection from '../../components/Updates/FinancialSection'
import GeneralSection from '../../components/Updates/GeneralSection'
import UpdateMarkdownView from '../../components/Updates/UpdateMarkdownView'
import {
  FinancialUpdateSection,
  GeneralUpdateSection,
  GeneralUpdateSectionSchema,
  UpdateAttributes,
  UpdateStatus,
  UpdateSubmissionDetails,
} from '../../entities/Updates/types'
import { getLatestUpdate, getReleases } from '../../entities/Updates/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePreventNavigation from '../../hooks/usePreventNavigation'
import useProposal from '../../hooks/useProposal'
import useProposalUpdate from '../../hooks/useProposalUpdate'
import useProposalUpdates from '../../hooks/useProposalUpdates'
import useVestingContractData from '../../hooks/useVestingContractData'
import locations, { navigate } from '../../utils/locations'

import './submit.css'
import './update.css'

interface Props {
  isEdit?: boolean
}

type UpdateValidationState = {
  generalSectionValid: boolean
  financialSectionValid: boolean
}

const NOW = new Date()

const intialValidationState: UpdateValidationState = {
  generalSectionValid: false,
  financialSectionValid: false,
}

const initialGeneralState: Partial<GeneralUpdateSection> | undefined = undefined
const initialFinancialState: FinancialUpdateSection | undefined = undefined

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
  const [ff] = useFeatureFlagContext()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id')
  const [isPreviewMode, setPreviewMode] = useState(false)
  const { update, isLoadingUpdate, isErrorOnUpdate, refetchUpdate } = useProposalUpdate(updateId)
  const proposalId = useMemo(() => params.get('proposalId') || update?.proposal_id || '', [update, params])
  const { proposal } = useProposal(proposalId)
  const { publicUpdates } = useProposalUpdates(proposalId)
  const vestingAddresses = proposal?.vesting_addresses || []
  const { vestingData } = useVestingContractData(vestingAddresses)
  const [error, setError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [generalSection, patchGeneralSection] = useState(initialGeneralState)
  const [financialSection, patchFinancialSection] = useState(initialFinancialState)
  const [csvInputField, patchCsvInputField] = useState<string | undefined>()
  const [validationState, patchValidationState] = useState<UpdateValidationState>(intialValidationState)
  const isValidToSubmit = Object.values(validationState).every((valid) => valid)
  const isAuthDappEnabled = ff.enabled(DappsFeatureFlags.AuthDappEnabled)

  usePreventNavigation(true)

  const releases = useMemo(() => (vestingData ? getReleases(vestingData) : undefined), [vestingData])

  const handleGeneralSectionValidation = useCallback(
    (data: GeneralUpdateSection, sectionValid: boolean) => {
      patchGeneralSection((prevState) => ({ ...prevState, ...data }))
      patchValidationState((prevState) => ({ ...prevState, generalSectionValid: sectionValid }))
    },
    [patchGeneralSection, patchValidationState]
  )

  const handleFinancialSectionValidation = useCallback(
    (data: FinancialUpdateSection | undefined, sectionValid: boolean) => {
      if (data) {
        patchFinancialSection((prevState) => ({ ...prevState, ...data }))
      }
      patchValidationState((prevState) => ({ ...prevState, financialSectionValid: sectionValid }))
    },
    [patchFinancialSection, patchValidationState]
  )

  const previewUpdate = useMemo(
    () => ({
      ...generalSection,
      ...financialSection,
      status: UpdateStatus.Pending,
      created_at: NOW,
      updated_at: NOW,
    }),
    [financialSection, generalSection]
  )

  const submitUpdate = async (data: GeneralUpdateSection & FinancialUpdateSection) => {
    if (!proposalId) {
      return
    }

    setFormDisabled(true)

    const newUpdate: UpdateSubmissionDetails & GeneralUpdateSection & FinancialUpdateSection = {
      author: account!,
      health: data.health,
      introduction: data.introduction,
      highlights: data.highlights,
      blockers: data.blockers,
      next_steps: data.next_steps,
      additional_notes: data.additional_notes,
      financial_records: data.financial_records,
    }

    try {
      if (updateId) {
        await Governance.get().updateProposalUpdate(proposalId, { id: updateId, ...newUpdate })
        if (isEdit) {
          setIsEditModalOpen(false)
        }
      } else {
        await Governance.get().createProposalUpdate(proposalId, newUpdate)
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

  const onSubmit: SubmitHandler<GeneralUpdateSection & FinancialUpdateSection> = (data) => {
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
        <Head title={title} description={description} />
        <SignIn
          isConnecting={accountState.selecting || accountState.loading}
          onConnect={isAuthDappEnabled ? accountState.authorize : accountState.select}
        />
      </Container>
    )
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setFormDisabled(false)
  }

  const latestUpdate = getLatestUpdate(publicUpdates || [])

  return (
    <div>
      <ContentLayout>
        <Head title={title} description={description} />
        <ContentSection className="UpdateSubmit__HeaderContainer">
          <h1 className="UpdateSubmit__HeaderTitle">{title}</h1>
          <Text size="lg">{description}</Text>
        </ContentSection>
      </ContentLayout>
      {!isPreviewMode && (
        <>
          <GeneralSection
            isFormDisabled={formDisabled}
            intialValues={
              generalSection ||
              getInitialUpdateValues<GeneralUpdateSection>(
                update,
                (key) => key in GeneralUpdateSectionSchema.properties
              )
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
              getInitialUpdateValues<FinancialUpdateSection>(
                update,
                (key) => key in ({ financial_records: [] } as FinancialUpdateSection)
              )
            }
            releases={releases}
            latestUpdate={latestUpdate}
            csvInputField={csvInputField}
            setCSVInputField={patchCsvInputField}
          />
        </>
      )}
      <Container>
        {isPreviewMode && (
          <UpdateMarkdownView update={previewUpdate} proposal={proposal} previousUpdate={latestUpdate} />
        )}
      </Container>
      <Container className="ContentLayout__Container">
        <ContentSection className="UpdateSubmit__Actions">
          <Button
            primary
            disabled={formDisabled || !isValidToSubmit}
            loading={formDisabled}
            onClick={() =>
              onSubmit({ ...generalSection, ...financialSection } as GeneralUpdateSection & FinancialUpdateSection)
            }
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
      </Container>
      {isEdit && (
        <EditUpdateModal
          loading={formDisabled}
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          onClickAccept={() =>
            submitUpdate({ ...generalSection, ...financialSection } as GeneralUpdateSection & FinancialUpdateSection)
          }
        />
      )}
    </div>
  )
}
