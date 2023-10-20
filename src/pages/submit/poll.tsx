import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field as DCLField } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import omit from 'lodash/omit'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'

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
import { SUBMISSION_THRESHOLD_POLL } from '../../entities/Proposal/constants'
import { INVALID_PROPOSAL_POLL_OPTIONS, newProposalPollScheme } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import locations, { navigate } from '../../utils/locations'

import './poll.css'
import './submit.css'

type PollState = {
  title: string
  description: string
  choices: Record<string, string>
  coAuthors?: string[]
}

const schema = newProposalPollScheme.properties

const initialState: PollState = {
  title: '',
  description: '',
  choices: {
    '0': '',
    '1': '',
  },
}

export default function SubmitPoll() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    setError: setFormError,
    watch,
    clearErrors,
  } = useForm<PollState>({ defaultValues: initialState, mode: 'onTouched' })
  const [error, setError] = useState('')
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(account)
  const submissionVpNotMet = useMemo(
    () => !!vpDistribution && vpDistribution.total < Number(SUBMISSION_THRESHOLD_POLL),
    [vpDistribution]
  )
  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)
  const values = useWatch({ control })

  function handleAddOption(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    clearErrors('choices')
    setValue('choices', {
      ...values.choices,
      [Date.now()]: '',
    })
  }

  function handleRemoveOption(i: string) {
    clearErrors('choices')
    const choices = omit(values.choices, [i]) as Record<string, string>
    if (Object.keys(choices).length < 2) {
      choices[Date.now()] = ''
    }
    setValue('choices', choices)
  }

  function handleEditOption(i: string, value: string) {
    clearErrors('choices')
    const choices = {
      ...values.choices,
      [i]: value,
    } as Record<string, string>
    setValue('choices', choices)
  }

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const isValidChoices = useCallback(
    (choices: Record<string, string>) => {
      const choicesValues = Object.values(choices)

      if (choicesValues.every((option) => option === '')) {
        setFormError('choices', { message: t('error.poll.choices_empty') })

        return false
      }

      if (choicesValues.length < schema.choices.minItems) {
        setFormError('choices', { message: t('error.poll.choices_insufficient') })

        return false
      }

      if (choicesValues.some((option) => option.length <= schema.choices.items.minLength)) {
        setFormError('choices', { message: t('error.poll.choices_too_short') })

        return false
      }

      if (choicesValues.some((option) => option.length >= schema.choices.items.maxLength)) {
        setFormError('choices', { message: t('error.poll.choices_too_long') })

        return false
      }

      return true
    },
    [setFormError, t]
  )

  const onSubmit: SubmitHandler<PollState> = useCallback(
    async (data) => {
      if (!isValidChoices(data.choices)) {
        return
      }

      setFormDisabled(true)
      const choices = Object.keys(data.choices)
        .sort()
        .map((key) => data.choices[key])

      try {
        const proposal = await Governance.get().createProposalPoll({
          ...data,
          choices,
        })
        navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
      } catch (error: any) {
        setError(error.body?.error || error.message)
        setFormDisabled(false)
      }
    },
    [isValidChoices]
  )

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={t('page.submit_poll.title') || ''} description={t('page.submit_poll.description') || ''} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_poll.title') || ''}
        description={t('page.submit_poll.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_poll.title') || ''} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_poll.title')}</Header>
        </ContentSection>
        <ContentSection>
          <Markdown>{t('page.submit_poll.description')}</Markdown>
        </ContentSection>

        <ContentSection>
          <Label>{t('page.submit_poll.title_label')}</Label>
          <SubLabel>{t('page.submit_poll.title_detail')}</SubLabel>
          <Field
            name="title"
            control={control}
            error={!!errors.title}
            rules={{
              required: { value: true, message: t('error.poll.title_empty') },
              minLength: {
                value: schema.title.minLength,
                message: t('error.poll.title_too_short'),
              },
              maxLength: {
                value: schema.title.maxLength,
                message: t('error.poll.title_too_large'),
              },
            }}
            message={
              t(errors.title?.message) +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('title').length,
                limit: schema.title.maxLength,
              })
            }
            loading={isLoadingVpDistribution}
            disabled={submissionVpNotMet || formDisabled}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_poll.description_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_poll.description_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="description"
            rules={{
              required: { value: true, message: t('error.poll.description_empty') },
              minLength: {
                value: schema.description.minLength,
                message: t('error.poll.description_too_short'),
              },
              maxLength: {
                value: schema.description.maxLength,
                message: t('error.poll.description_too_large'),
              },
            }}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.description}
            message={
              (errors.description?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('description').length,
                limit: schema.description.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_poll.choices_label')}</Label>
          {errors && (
            <Text size="lg" color="primary">
              {errors.choices?.message}
            </Text>
          )}
          <div className="Poll__Options">
            {values.choices &&
              Object.keys(values.choices)
                .sort()
                .map((key, i) => (
                  <DCLField
                    key={key}
                    placeholder={'choice ' + String(i + 1)}
                    value={values.choices?.[key]}
                    action={<Icon name="x" />}
                    onAction={() => handleRemoveOption(key)}
                    onChange={(_, { value }) => handleEditOption(key, value)}
                    disabled={submissionVpNotMet || formDisabled}
                  />
                ))}
            <DCLField
              readOnly
              value={INVALID_PROPOSAL_POLL_OPTIONS}
              className="input--disabled"
              action={
                <Popup
                  content={t('page.submit_poll.mandatory_option')}
                  position="top center"
                  trigger={<Icon name="x" />}
                  on="hover"
                />
              }
              onAction={() => null}
            />
            <Button basic fluid onClick={handleAddOption}>
              {t('page.submit_poll.choices_add')}
            </Button>
          </div>
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={formDisabled || submissionVpNotMet} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary disabled={formDisabled || submissionVpNotMet} loading={isSubmitting}>
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {submissionVpNotMet && (
          <ContentSection>
            <Text size="lg" color="primary">
              {t('error.poll.submission_vp_not_met')}
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
