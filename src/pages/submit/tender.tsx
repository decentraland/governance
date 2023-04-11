import React, { useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { SelectField } from 'decentraland-ui/dist/components/SelectField/SelectField'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../clients/Governance'
import Field from '../../components/Common/Form/Field'
import ErrorMessage from '../../components/Error/ErrorMessage'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import CoAuthors from '../../components/Proposal/Submit/CoAuthor/CoAuthors'
import LogIn from '../../components/User/LogIn'
import { SUBMISSION_THRESHOLD_PITCH } from '../../entities/Proposal/constants'
import { NewProposalTender, newProposalTenderScheme } from '../../entities/Proposal/types'
import usePreselectedProposal from '../../hooks/usePreselectedProposal'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './submit.css'

const initialState: NewProposalTender = {
  linked_proposal_id: '',
  project_name: '',
  summary: '',
  problem_statement: '',
  technical_specification: '',
  use_cases: '',
  deliverables: '',
  target_release_date: new Date(),
}
const schema = newProposalTenderScheme.properties

export default function SubmitTenderProposal() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const [account, accountState] = useAuthContext()
  const accountBalance = isEthereumAddress(params.get('address') || '') ? params.get('address') : account
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(accountBalance)
  const submissionVpNotMet = useMemo(
    () => !!vpDistribution && vpDistribution.total < Number(SUBMISSION_THRESHOLD_PITCH),
    [vpDistribution]
  )
  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)
  const [error, setError] = useState('')

  const preselectedLinkedProposalId = params.get('linked_proposal_id')
  const preselectedProposal = usePreselectedProposal(preselectedLinkedProposalId)

  const {
    handleSubmit,
    formState: { isDirty, errors },
    control,
    setValue,
    watch,
  } = useForm<NewProposalTender>({ defaultValues: initialState, mode: 'onTouched' })

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  useEffect(() => {
    if (preselectedLinkedProposalId) {
      setValue('linked_proposal_id', preselectedLinkedProposalId)
    }
  }, [preselectedLinkedProposalId, setValue])

  const onSubmit: SubmitHandler<NewProposalTender> = async (data) => {
    setFormDisabled(true)

    try {
      const proposal = await Governance.get().createProposalTender({
        ...data,
      })

      loader.proposals.set(proposal.id, proposal)
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
    return <LogIn title={t('page.submit_tender.title') || ''} description={t('page.submit_tender.description') || ''} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_tender.title') || ''}
        description={t('page.submit_tender.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_tender.title') || ''} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_tender.title')}</Header>
        </ContentSection>
        <ContentSection className="MarkdownSection--tiny">
          <Markdown>{t('page.submit_tender.description')}</Markdown>
        </ContentSection>

        <ContentSection>
          <Label>{t('page.submit_draft.linked_proposal_label')}</Label>
          <SelectField
            value={watch('linked_proposal_id') || undefined}
            options={preselectedProposal}
            error={!!errors.linked_proposal_id}
            message={errors.linked_proposal_id?.message}
            rules={{ required: { value: true, message: t('error.tender.linked_proposal_empty') } }}
            disabled
            loading={isLoadingVpDistribution}
          />
        </ContentSection>

        <ContentSection>
          <Label>
            {t('page.submit_tender.project_name_label')}
            <MarkdownNotice />
          </Label>
          <Field
            control={control}
            name="project_name"
            rules={{
              required: { value: true, message: t('error.tender.project_name_empty') },
              min: { value: schema.project_name.minLength, message: t('error.tender.project_name_too_short') },
              max: { value: schema.project_name.maxLength, message: t('error.tender.project_name_too_long') },
            }}
            error={!!errors.project_name}
            loading={isLoadingVpDistribution}
            disabled={submissionVpNotMet || formDisabled}
            message={
              (errors.project_name?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('project_name').length,
                limit: schema.project_name.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.summary_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_tender.summary_description')}
          </Paragraph>
          <Controller
            control={control}
            name="summary"
            rules={{
              required: { value: true, message: t('error.tender.summary_empty') },
              minLength: {
                value: schema.summary.minLength,
                message: t('error.tender.summary_too_short'),
              },
              maxLength: {
                value: schema.summary.maxLength,
                message: t('error.tender.summary_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
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
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.problem_statement_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_tender.problem_statement_description')}
          </Paragraph>
          <Controller
            control={control}
            name="problem_statement"
            rules={{
              required: { value: true, message: t('error.tender.problem_statement_empty') },
              minLength: {
                value: schema.problem_statement.minLength,
                message: t('error.tender.problem_statement_too_short'),
              },
              maxLength: {
                value: schema.problem_statement.maxLength,
                message: t('error.tender.problem_statement_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.problem_statement}
                message={
                  (errors.problem_statement?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('problem_statement').length,
                    limit: schema.problem_statement.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.technical_specification_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_tender.technical_specification_description')}
          </Paragraph>
          <Controller
            control={control}
            name="technical_specification"
            rules={{
              required: { value: true, message: t('error.tender.technical_specification_empty') },
              minLength: {
                value: schema.technical_specification.minLength,
                message: t('error.tender.technical_specification_too_short'),
              },
              maxLength: {
                value: schema.technical_specification.maxLength,
                message: t('error.tender.technical_specification_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.technical_specification}
                message={
                  (errors.technical_specification?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('technical_specification').length,
                    limit: schema.technical_specification.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.use_cases_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_tender.use_cases_description')}
          </Paragraph>
          <Controller
            control={control}
            name="use_cases"
            rules={{
              required: { value: true, message: t('error.tender.use_cases_empty') },
              minLength: {
                value: schema.use_cases.minLength,
                message: t('error.tender.use_cases_too_short'),
              },
              maxLength: {
                value: schema.use_cases.maxLength,
                message: t('error.tender.use_cases_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.use_cases}
                message={
                  (errors.use_cases?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('use_cases').length,
                    limit: schema.use_cases.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.deliverables_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_tender.deliverables_description')}
          </Paragraph>
          <Controller
            control={control}
            name="deliverables"
            rules={{
              required: { value: true, message: t('error.tender.deliverables_empty') },
              minLength: {
                value: schema.deliverables.minLength,
                message: t('error.tender.deliverables_too_short'),
              },
              maxLength: {
                value: schema.deliverables.maxLength,
                message: t('error.tender.deliverables_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.deliverables}
                message={
                  (errors.deliverables?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('deliverables').length,
                    limit: schema.deliverables.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.target_release_date_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_tender.target_release_date_description')}
          </Paragraph>
          <Field
            type="date"
            control={control}
            name="target_release_date"
            rules={{
              required: { value: true, message: t('error.tender.target_release_date_empty') },
              // TODO: Check if date is in the future
            }}
            error={!!errors.project_name}
            loading={isLoadingVpDistribution}
            disabled={submissionVpNotMet || formDisabled}
            message={
              (errors.project_name?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('project_name').length,
                limit: schema.project_name.maxLength,
              })
            }
          />
          {/* TODO: Add target release date input */}
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={submissionVpNotMet || formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary loading={formDisabled} disabled={formDisabled}>
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {submissionVpNotMet && (
          <ContentSection>
            <Paragraph small primary>
              {t('error.tender.submission_vp_not_met')}
            </Paragraph>
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
