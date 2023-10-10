import { useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { SubmitHandler, useForm } from 'react-hook-form'

import { useLocation } from '@reach/router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'

import { Governance } from '../../clients/Governance'
import Field from '../../components/Common/Form/Field'
import MarkdownField from '../../components/Common/Form/MarkdownField'
import SubLabel from '../../components/Common/SubLabel'
import Label from '../../components/Common/Typography/Label'
import Markdown from '../../components/Common/Typography/Markdown'
import Text from '../../components/Common/Typography/Text'
import ErrorMessage from '../../components/Error/ErrorMessage'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/Layout/LogIn'
import CoAuthors from '../../components/Proposal/Submit/CoAuthor/CoAuthors'
import { SUBMISSION_THRESHOLD_GOVERNANCE } from '../../entities/Proposal/constants'
import { NewProposalDraft, NewProposalGovernance, newProposalGovernanceScheme } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePreselectedProposal from '../../hooks/usePreselectedProposal'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import locations, { navigate } from '../../utils/locations'

import './submit.css'

const initialState: NewProposalGovernance = {
  linked_proposal_id: '',
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

export default function SubmitGovernanceProposal() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const preselectedLinkedProposalId = params.get('linked_proposal_id')
  const [account, accountState] = useAuthContext()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(account)
  const submissionVpNotMet = useMemo(
    () => !!vpDistribution && vpDistribution.total < Number(SUBMISSION_THRESHOLD_GOVERNANCE),
    [vpDistribution]
  )
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    watch,
  } = useForm<NewProposalGovernance>({ defaultValues: initialState, mode: 'onTouched' })
  const preventNavigation = useRef(false)
  const [error, setError] = useState('')
  const [formDisabled, setFormDisabled] = useState(false)
  const preselectedProposal = usePreselectedProposal(preselectedLinkedProposalId)

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  useEffect(() => {
    if (preselectedLinkedProposalId) {
      setValue('linked_proposal_id', preselectedLinkedProposalId)
    }
  }, [preselectedLinkedProposalId, setValue])

  useEffect(() => {
    const linkedProposal = preselectedProposal?.proposal
    if (linkedProposal) {
      const configuration = linkedProposal.configuration as NewProposalDraft
      setValue('linked_proposal_id', linkedProposal.id)
      setValue('title', configuration.title)
      setValue('summary', configuration.summary)
      setValue('abstract', configuration.abstract)
      setValue('motivation', configuration.motivation)
      setValue('specification', configuration.specification)
      setValue('conclusion', configuration.conclusion)
    }
  }, [preselectedProposal?.proposal, setValue])

  const onSubmit: SubmitHandler<NewProposalGovernance> = async (data) => {
    setFormDisabled(true)

    try {
      const proposal = await Governance.get().createProposalGovernance({
        ...data,
        linked_proposal_id: data.linked_proposal_id,
      })

      navigate(locations.proposal(proposal.id, { new: 'true' }), {
        replace: true,
      })
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  if (accountState.loading) {
    return <LoadingView />
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
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_governance.title') || ''}
        description={t('page.submit_governance.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_governance.title') || ''} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_governance.title')}</Header>
        </ContentSection>
        <ContentSection>
          <Markdown>{t('page.submit_governance.description')}</Markdown>
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_governance.linked_proposal_label')}</Label>
          <SelectField
            value={watch('linked_proposal_id') || undefined}
            options={preselectedProposal?.selectOption}
            error={!!errors.linked_proposal_id}
            message={errors.linked_proposal_id?.message}
            rules={{ required: { value: true, message: t('error.governance.linked_proposal_empty') } }}
            disabled
            loading={isLoadingVpDistribution}
          />
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_governance.title_label')}</Label>
          <Field
            control={control}
            placeholder={t('page.submit_governance.title_placeholder')}
            name="title"
            rules={{
              required: { value: true, message: t('error.governance.title_empty') },
              minLength: { value: schema.title.minLength, message: t('error.governance.title_too_short') },
              maxLength: { value: schema.title.maxLength, message: t('error.governance.title_too_large') },
            }}
            error={!!errors.title}
            loading={isLoadingVpDistribution}
            disabled={submissionVpNotMet || formDisabled}
            message={
              (errors.title?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('title').length,
                limit: schema.title.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_governance.summary_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_governance.summary_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="summary"
            rules={{
              required: { value: true, message: t('error.governance.summary_empty') },
              minLength: {
                value: schema.summary.minLength,
                message: t('error.governance.summary_too_short'),
              },
              maxLength: {
                value: schema.summary.maxLength,
                message: t('error.governance.summary_too_large'),
              },
            }}
            placeholder={t('page.submit_governance.summary_placeholder')}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.summary}
            message={
              (errors.summary?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('summary').length,
                limit: schema.summary.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_governance.abstract_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_governance.abstract_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="abstract"
            rules={{
              required: { value: true, message: t('error.governance.abstract_empty') },
              minLength: {
                value: schema.abstract.minLength,
                message: t('error.governance.abstract_too_short'),
              },
              maxLength: {
                value: schema.abstract.maxLength,
                message: t('error.governance.abstract_too_large'),
              },
            }}
            placeholder={t('page.submit_governance.abstract_placeholder')}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.abstract}
            message={
              (errors.abstract?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('abstract').length,
                limit: schema.abstract.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_governance.motivation_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_governance.motivation_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="motivation"
            rules={{
              required: { value: true, message: t('error.governance.motivation_empty') },
              minLength: {
                value: schema.motivation.minLength,
                message: t('error.governance.motivation_too_short'),
              },
              maxLength: {
                value: schema.motivation.maxLength,
                message: t('error.governance.motivation_too_large'),
              },
            }}
            placeholder={t('page.submit_governance.motivation_placeholder')}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.motivation}
            message={
              (errors.motivation?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('motivation').length,
                limit: schema.motivation.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_governance.specification_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_governance.specification_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="specification"
            rules={{
              required: { value: true, message: t('error.governance.specification_empty') },
              minLength: {
                value: schema.specification.minLength,
                message: t('error.governance.specification_too_short'),
              },
              maxLength: {
                value: schema.specification.maxLength,
                message: t('error.governance.specification_too_large'),
              },
            }}
            placeholder={t('page.submit_governance.specification_placeholder')}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.specification}
            message={
              (errors.specification?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('specification').length,
                limit: schema.specification.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_governance.impacts_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_governance.impacts_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="impacts"
            rules={{
              required: { value: true, message: t('error.governance.impacts_empty') },
              minLength: {
                value: schema.impacts.minLength,
                message: t('error.governance.impacts_too_short'),
              },
              maxLength: {
                value: schema.impacts.maxLength,
                message: t('error.governance.impacts_too_large'),
              },
            }}
            placeholder={t('page.submit_governance.impacts_placeholder')}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.impacts}
            message={
              (errors.impacts?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('impacts').length,
                limit: schema.impacts.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_governance.implementation_pathways_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_governance.implementation_pathways_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="implementation_pathways"
            rules={{
              required: { value: true, message: t('error.governance.implementation_pathways_empty') },
              minLength: {
                value: schema.implementation_pathways.minLength,
                message: t('error.governance.implementation_pathways_too_short'),
              },
              maxLength: {
                value: schema.implementation_pathways.maxLength,
                message: t('error.governance.implementation_pathways_too_large'),
              },
            }}
            placeholder={t('page.submit_governance.implementation_pathways_placeholder')}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.implementation_pathways}
            message={
              (errors.implementation_pathways?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('implementation_pathways').length,
                limit: schema.implementation_pathways.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_governance.conclusion_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_governance.conclusion_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="conclusion"
            rules={{
              required: { value: true, message: t('error.governance.conclusion_empty') },
              minLength: {
                value: schema.conclusion.minLength,
                message: t('error.governance.conclusion_too_short'),
              },
              maxLength: {
                value: schema.conclusion.maxLength,
                message: t('error.governance.conclusion_too_large'),
              },
            }}
            placeholder={t('page.submit_governance.conclusion_placeholder')}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.conclusion}
            message={
              (errors.conclusion?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('conclusion').length,
                limit: schema.conclusion.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary loading={isSubmitting} disabled={submissionVpNotMet || formDisabled}>
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {submissionVpNotMet && (
          <ContentSection>
            <Text size="lg" color="primary">
              {t('error.governance.submission_vp_not_met')}
            </Text>
          </ContentSection>
        )}
        {error && (
          <ContentSection>
            <ErrorMessage label={t('page.submit.error_label')} errorMessage={t(error) || error} />
          </ContentSection>
        )}
      </form>
    </ContentLayout>
  )
}
