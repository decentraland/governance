import React, { useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import { useLocation } from '@gatsbyjs/reach-router'
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
import { NewProposalPitch, newProposalPitchScheme } from '../../entities/Proposal/types'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './submit.css'

const initialState: NewProposalPitch = {
  initiativeName: '',
  targetAudience: '',
  problemStatement: '',
  proposedSolution: '',
  relevancy: '',
}
const schema = newProposalPitchScheme.properties

export default function SubmitPitchProposal() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
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

  const {
    handleSubmit,
    formState: { isDirty, errors },
    control,
    setValue,
    watch,
  } = useForm<NewProposalPitch>({ defaultValues: initialState, mode: 'onTouched' })

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<NewProposalPitch> = async (data) => {
    setFormDisabled(true)

    try {
      const proposal = await Governance.get().createProposalPitch({
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
    return <LogIn title={t('page.submit_pitch.title') || ''} description={t('page.submit_pitch.description') || ''} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_pitch.title') || ''}
        description={t('page.submit_pitch.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_pitch.title') || ''} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_pitch.title')}</Header>
        </ContentSection>
        <ContentSection className="MarkdownSection--tiny">
          <Markdown>{t('page.submit_pitch.description')}</Markdown>
        </ContentSection>

        <ContentSection>
          <Label>
            {t('page.submit_pitch.initiative_name_label')}
            <MarkdownNotice />
          </Label>
          <Field
            control={control}
            name="initiativeName"
            rules={{
              required: { value: true, message: t('error.pitch.initiative_name_empty') },
              min: { value: schema.initiativeName.minLength, message: t('error.pitch.initiative_name_too_short') },
              max: { value: schema.initiativeName.maxLength, message: t('error.pitch.initiative_name_too_long') },
            }}
            error={!!errors.initiativeName}
            loading={isLoadingVpDistribution}
            disabled={submissionVpNotMet || formDisabled}
            message={
              (errors.initiativeName?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('initiativeName').length,
                limit: schema.initiativeName.maxLength,
              })
            }
          />
          <span className="Input__PostLabel">{t('page.submit_pitch.initiative_name_postlabel')}</span>
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.target_audience_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.target_audience_detail')}
          </Paragraph>
          <Controller
            control={control}
            name="targetAudience"
            rules={{
              required: { value: true, message: t('error.pitch.target_audience_empty') },
              minLength: {
                value: schema.targetAudience.minLength,
                message: t('error.pitch.target_audience_too_short'),
              },
              maxLength: {
                value: schema.targetAudience.maxLength,
                message: t('error.pitch.target_audience_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.targetAudience}
                message={
                  (errors.targetAudience?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('targetAudience').length,
                    limit: schema.targetAudience.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.problem_statement_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.problem_statement_detail')}
          </Paragraph>
          <Controller
            control={control}
            name="problemStatement"
            rules={{
              required: { value: true, message: t('error.pitch.problem_statement_empty') },
              minLength: {
                value: schema.problemStatement.minLength,
                message: t('error.pitch.problem_statement_too_short'),
              },
              maxLength: {
                value: schema.problemStatement.maxLength,
                message: t('error.pitch.problem_statement_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.problemStatement}
                message={
                  (errors.problemStatement?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('problemStatement').length,
                    limit: schema.problemStatement.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.proposed_solution_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.proposed_solution_detail')}
          </Paragraph>
          <Controller
            control={control}
            name="proposedSolution"
            rules={{
              required: { value: true, message: t('error.pitch.proposed_solution_empty') },
              minLength: {
                value: schema.proposedSolution.minLength,
                message: t('error.pitch.proposed_solution_too_short'),
              },
              maxLength: {
                value: schema.proposedSolution.maxLength,
                message: t('error.pitch.proposed_solution_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.proposedSolution}
                message={
                  (errors.proposedSolution?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('proposedSolution').length,
                    limit: schema.proposedSolution.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.relevancy_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.relevancy_detail')}
          </Paragraph>
          <Controller
            control={control}
            name="relevancy"
            rules={{
              required: { value: true, message: t('error.pitch.relevancy_empty') },
              minLength: {
                value: schema.relevancy.minLength,
                message: t('error.pitch.relevancy_too_short'),
              },
              maxLength: {
                value: schema.relevancy.maxLength,
                message: t('error.pitch.relevancy_too_large'),
              },
            }}
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
                error={!!errors.relevancy}
                message={
                  (errors.relevancy?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('relevancy').length,
                    limit: schema.relevancy.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
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
              {t('error.pitch.submission_vp_not_met')}
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
