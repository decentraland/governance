import React, { useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
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
import { newProposalCatalystScheme } from '../../entities/Proposal/types'
import { isAlreadyACatalyst, isValidDomainName } from '../../entities/Proposal/utils'
import locations from '../../modules/locations'

import './catalyst.css'
import './submit.css'

type CatalystState = {
  owner: string
  domain: string
  description: string
  coAuthors?: string[]
}

const schema = newProposalCatalystScheme.properties

const initialState: CatalystState = {
  owner: '',
  domain: '',
  description: '',
}

export default function SubmitCatalyst() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    watch,
    setError: setFormError,
  } = useForm<CatalystState>({ defaultValues: initialState, mode: 'onTouched' })
  const [error, setError] = useState('')
  const [domain, setDomain] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_commsStatus, commsState] = useAsyncMemo(
    async () => (domain ? Catalyst.from('https://' + domain).getCommsStatus() : null),
    [domain]
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_contentStatus, contentState] = useAsyncMemo(
    async () => (domain ? Catalyst.from('https://' + domain).getContentStatus() : null),
    [domain]
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lambdaStatus, lambdaState] = useAsyncMemo(
    async () => (domain ? Catalyst.from('https://' + domain).getLambdasStatus() : null),
    [domain]
  )
  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)

  useEffect(() => {
    if (!errors.domain && (commsState.error || contentState.error || lambdaState.error)) {
      setFormError('domain', { message: t('error.catalyst.server_invalid_status') })
    }
  }, [commsState.error, contentState.error, lambdaState.error, errors.domain, setFormError, t])

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<CatalystState> = async (data) => {
    const errors = [commsState.error, contentState.error, lambdaState.error].filter(Boolean)
    if (errors.length > 0) {
      setFormError('domain', { message: t('error.catalyst.server_invalid_status') })
      setError('error.catalyst.server_invalid_status')

      return
    }

    const loading = [commsState.loading, contentState.loading, lambdaState.loading].filter(Boolean)
    if (loading.length > 0) {
      return
    }

    setFormDisabled(true)

    try {
      if (await isAlreadyACatalyst(data.domain)) {
        throw new Error('error.catalyst.domain_already_a_catalyst')
      }

      const proposal = await Governance.get().createProposalCatalyst(data)
      navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
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
      <LogIn title={t('page.submit_catalyst.title') || ''} description={t('page.submit_catalyst.description') || ''} />
    )
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_catalyst.title') || ''}
        description={t('page.submit_catalyst.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_catalyst.title') || ''} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_catalyst.title')}</Header>
        </ContentSection>
        <ContentSection>
          <Paragraph small>{t('page.submit_catalyst.description')}</Paragraph>
          <Paragraph small>{t('page.submit_catalyst.description_2')}</Paragraph>
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_catalyst.owner_label')}</Label>
          <Field
            control={control}
            name="owner"
            type="address"
            placeholder={t('page.submit_catalyst.owner_placeholder')}
            message={errors.owner?.message}
            error={!!errors.owner}
            disabled={formDisabled}
            rules={{
              required: { value: true, message: t('error.catalyst.owner_empty') },
              validate: (value: string) => {
                if (!isEthereumAddress(value)) {
                  return t('error.catalyst.owner_invalid')
                }
              },
            }}
          />
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_catalyst.domain_label')}</Label>
          <Field
            control={control}
            name="domain"
            placeholder={t('page.submit_catalyst.domain_placeholder')}
            error={!!errors.domain}
            message={t(errors.domain?.message)}
            disabled={formDisabled}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
            rules={{
              required: { value: true, message: t('error.catalyst.domain_empty') },
              validate: (value: string) => {
                if (!isValidDomainName(value)) {
                  return t('error.catalyst.domain_invalid')
                }
              },
            }}
          />
          {!!domain && (
            <div>
              <Paragraph tiny>
                {commsState.loading && (
                  <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_comms_checking')}</span>
                )}
                {commsState.error && (
                  <span className="Catalyst__Error">{t('page.submit_catalyst.domain_comms_failed')}</span>
                )}
                {!commsState.loading && !commsState.error && (
                  <span className="Catalyst__Success">{t('page.submit_catalyst.domain_comms_ok')}</span>
                )}
                {contentState.loading && (
                  <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_content_checking')}</span>
                )}
                {contentState.error && (
                  <span className="Catalyst__Error">{t('page.submit_catalyst.domain_content_failed')}</span>
                )}
                {!contentState.loading && !contentState.error && (
                  <span className="Catalyst__Success">{t('page.submit_catalyst.domain_content_ok')}</span>
                )}
                {lambdaState.loading && (
                  <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_lambda_checking')}</span>
                )}
                {lambdaState.error && (
                  <span className="Catalyst__Error">{t('page.submit_catalyst.domain_lambda_failed')}</span>
                )}
                {!lambdaState.loading && !lambdaState.error && (
                  <span className="Catalyst__Success">{t('page.submit_catalyst.domain_lambda_ok')}</span>
                )}
              </Paragraph>
            </div>
          )}
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_catalyst.description_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_catalyst.description_detail')}
          </Paragraph>
          <Controller
            control={control}
            name="description"
            rules={{
              required: { value: true, message: t('error.catalyst.description_empty') },
              minLength: {
                value: schema.description.minLength,
                message: t('error.catalyst.description_too_short'),
              },
              maxLength: {
                value: schema.description.maxLength,
                message: t('error.catalyst.description_too_large'),
              },
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                disabled={formDisabled}
                error={!!errors.description}
                message={
                  (errors.description?.message || '') +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('description').length,
                    limit: schema.description.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button
            primary
            disabled={formDisabled || commsState.loading || contentState.loading || lambdaState.loading}
            loading={isSubmitting || commsState.loading || contentState.loading || lambdaState.loading}
          >
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {error && (
          <ContentSection>
            <ErrorMessage label={t('page.submit.error_label')} errorMessage={t(error) || error} />
          </ContentSection>
        )}
      </form>
    </ContentLayout>
  )
}
