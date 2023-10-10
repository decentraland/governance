import { useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
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
import { SUBMISSION_THRESHOLD_TENDER } from '../../entities/Proposal/constants'
import { NewProposalTender, newProposalTenderScheme } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePreselectedProposal from '../../hooks/usePreselectedProposal'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import Time from '../../utils/date/Time'
import locations, { navigate } from '../../utils/locations'

import './submit.css'

const initialState: NewProposalTender = {
  linked_proposal_id: '',
  project_name: '',
  summary: '',
  problem_statement: '',
  technical_specification: '',
  use_cases: '',
  deliverables: '',
  target_release_quarter: '',
}
const schema = newProposalTenderScheme.properties

function getQuarters(onClick: (quarter: string) => void) {
  const now = Time.utc()
  const currentQuarter = now.quarter()
  const currentYear = now.year()
  const quarters = []
  for (let i = 0; i < 5; i++) {
    const quarter = currentQuarter + i
    const year = currentYear + Math.floor(quarter / 5)
    quarters.push(`${year} Q${quarter % 4 === 0 ? 4 : quarter % 4}`)
  }

  return quarters.map((quarter) => ({ key: quarter, text: quarter, value: quarter, onClick: () => onClick(quarter) }))
}

export default function SubmitTenderProposal() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const [account, accountState] = useAuthContext()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(account)
  const submissionVpNotMet = useMemo(
    () => !!vpDistribution && vpDistribution.total < Number(SUBMISSION_THRESHOLD_TENDER),
    [vpDistribution]
  )
  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)
  const [error, setError] = useState('')

  const preselectedLinkedProposalId = params.get('linked_proposal_id')
  const preselectedProposal = usePreselectedProposal(preselectedLinkedProposalId)

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
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

      navigate(locations.proposal(proposal.id, { pending: 'true' }), {
        replace: true,
      })
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  const title = t('page.submit_tender.title')
  const description = t('page.submit_tender.description', { threshold: SUBMISSION_THRESHOLD_TENDER })

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={title} description={description} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head title={title} description={description} image="https://decentraland.org/images/decentraland.png" />
      <Helmet title={title} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{title}</Header>
        </ContentSection>
        <ContentSection>
          <Markdown>{description}</Markdown>
        </ContentSection>

        <ContentSection>
          <Label>{t('page.submit_tender.linked_proposal_label')}</Label>
          <SelectField
            value={watch('linked_proposal_id') || undefined}
            options={preselectedProposal?.selectOption}
            error={!!errors.linked_proposal_id}
            message={errors.linked_proposal_id?.message}
            rules={{ required: { value: true, message: t('error.tender.linked_proposal_empty') } }}
            disabled
            loading={isLoadingVpDistribution}
          />
        </ContentSection>

        <ContentSection>
          <Label>{t('page.submit_tender.project_name_label')}</Label>
          <Field
            control={control}
            name="project_name"
            rules={{
              required: { value: true, message: t('error.tender.project_name_empty') },
              minLength: { value: schema.project_name.minLength, message: t('error.tender.project_name_too_short') },
              maxLength: { value: schema.project_name.maxLength, message: t('error.tender.project_name_too_large') },
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
          <SubLabel>{t('page.submit_tender.summary_description')}</SubLabel>
          <MarkdownField
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
            {t('page.submit_tender.problem_statement_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_tender.problem_statement_description')}</SubLabel>
          <MarkdownField
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
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.technical_specification_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_tender.technical_specification_description')}</SubLabel>
          <MarkdownField
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
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.use_cases_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_tender.use_cases_description')}</SubLabel>
          <MarkdownField
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
            minHeight={175}
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
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_tender.deliverables_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_tender.deliverables_description')}</SubLabel>
          <MarkdownField
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
            minHeight={175}
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
          />
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_tender.target_release_quarter_label')}</Label>
          <SubLabel>{t('page.submit_tender.target_release_quarter_description')}</SubLabel>
          <Controller
            control={control}
            name="target_release_quarter"
            rules={{
              required: { value: true, message: t('error.tender.target_release_quarter_empty') },
            }}
            render={() => (
              <Dropdown
                placeholder={t('page.submit_tender.target_release_quarter_placeholder')}
                fluid
                selection
                options={getQuarters((quarter) => setValue('target_release_quarter', quarter))}
                error={!!errors.target_release_quarter}
                loading={isLoadingVpDistribution}
                disabled={submissionVpNotMet || formDisabled}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={submissionVpNotMet || formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary loading={isSubmitting} disabled={submissionVpNotMet || formDisabled}>
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {submissionVpNotMet && (
          <ContentSection>
            <Text size="lg" color="primary">
              {t('error.tender.submission_vp_not_met', { threshold: SUBMISSION_THRESHOLD_TENDER })}
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
