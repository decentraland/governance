import { useEffect, useMemo, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

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
import Head from '../../components/Layout/Head'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/Layout/LogIn'
import CoAuthors from '../../components/Proposal/Submit/CoAuthor/CoAuthors'
import { SUBMISSION_THRESHOLD_DRAFT } from '../../entities/Proposal/constants'
import { NewProposalDraft, ProposalType, newProposalDraftScheme } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePreselectedProposal from '../../hooks/usePreselectedProposal'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import locations, { navigate } from '../../utils/locations'

import './submit.css'

const initialState: NewProposalDraft = {
  linked_proposal_id: '',
  title: '',
  summary: '',
  abstract: '',
  motivation: '',
  specification: '',
  conclusion: '',
}
const schema = newProposalDraftScheme.properties

export default function SubmitDraftProposal() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const preselectedLinkedProposalId = params.get('linked_proposal_id')
  const [account, accountState] = useAuthContext()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(account)
  const submissionVpNotMet = useMemo(
    () => !!vpDistribution && vpDistribution.total < Number(SUBMISSION_THRESHOLD_DRAFT),
    [vpDistribution]
  )
  const preselectedProposal = usePreselectedProposal(preselectedLinkedProposalId)
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    watch,
  } = useForm<NewProposalDraft>({ defaultValues: initialState, mode: 'onTouched' })
  const [error, setError] = useState('')
  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  useEffect(() => {
    if (preselectedLinkedProposalId) {
      setValue('linked_proposal_id', preselectedLinkedProposalId)
    }
  }, [preselectedLinkedProposalId, setValue])

  const onSubmit: SubmitHandler<NewProposalDraft> = async (data) => {
    setFormDisabled(true)

    try {
      const proposal = await Governance.get().createProposalDraft({
        ...data,
        linked_proposal_id: data.linked_proposal_id,
      })

      navigate(locations.proposal(proposal.id, { new: 'true' }), {
        replace: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={t('page.submit_draft.title')} description={t('page.submit_draft.description')} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_draft.title')}
        description={t('page.submit_draft.description')}
        links={[{ rel: 'canonical', href: locations.submit(ProposalType.Draft) }]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_draft.title')}</Header>
        </ContentSection>
        <ContentSection>
          <Markdown>{t('page.submit_draft.description')}</Markdown>
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_draft.linked_proposal_label')}</Label>
          <SelectField
            value={watch('linked_proposal_id') || undefined}
            options={preselectedProposal?.selectOption}
            error={!!errors.linked_proposal_id}
            message={errors.linked_proposal_id?.message}
            rules={{ required: { value: true, message: t('error.draft.linked_proposal_empty') } }}
            disabled
            loading={isLoadingVpDistribution}
          />
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_draft.title_label')}</Label>
          <Field
            control={control}
            placeholder={t('page.submit_draft.title_placeholder')}
            name="title"
            rules={{
              required: { value: true, message: t('error.draft.title_empty') },
              minLength: { value: schema.title.minLength, message: t('error.draft.title_too_short') },
              maxLength: { value: schema.title.maxLength, message: t('error.draft.title_too_large') },
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
            {t('page.submit_draft.summary_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_draft.summary_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="summary"
            rules={{
              required: { value: true, message: t('error.draft.summary_empty') },
              minLength: {
                value: schema.summary.minLength,
                message: t('error.draft.summary_too_short'),
              },
              maxLength: {
                value: schema.summary.maxLength,
                message: t('error.draft.summary_too_large'),
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
            {t('page.submit_draft.abstract_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_draft.abstract_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="abstract"
            rules={{
              required: { value: true, message: t('error.draft.abstract_empty') },
              minLength: {
                value: schema.abstract.minLength,
                message: t('error.draft.abstract_too_short'),
              },
              maxLength: {
                value: schema.abstract.maxLength,
                message: t('error.draft.abstract_too_large'),
              },
            }}
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
            {t('page.submit_draft.motivation_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_draft.motivation_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="motivation"
            rules={{
              required: { value: true, message: t('error.draft.motivation_empty') },
              minLength: {
                value: schema.motivation.minLength,
                message: t('error.draft.motivation_too_short'),
              },
              maxLength: {
                value: schema.motivation.maxLength,
                message: t('error.draft.motivation_too_large'),
              },
            }}
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
            {t('page.submit_draft.specification_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_draft.specification_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="specification"
            rules={{
              required: { value: true, message: t('error.draft.specification_empty') },
              minLength: {
                value: schema.specification.minLength,
                message: t('error.draft.specification_too_short'),
              },
              maxLength: {
                value: schema.specification.maxLength,
                message: t('error.draft.specification_too_large'),
              },
            }}
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
            {t('page.submit_draft.conclusion_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_draft.conclusion_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="conclusion"
            rules={{
              required: { value: true, message: t('error.draft.conclusion_empty') },
              minLength: {
                value: schema.conclusion.minLength,
                message: t('error.draft.conclusion_too_short'),
              },
              maxLength: {
                value: schema.conclusion.maxLength,
                message: t('error.draft.conclusion_too_large'),
              },
            }}
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
              {t('error.draft.submission_vp_not_met')}
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
