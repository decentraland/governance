import React, { useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { SubmitHandler, useForm } from 'react-hook-form'

import { useQuery } from '@tanstack/react-query'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../clients/Governance'
import Field from '../../components/Common/Form/Field'
import MarkdownField from '../../components/Common/Form/MarkdownField'
import Label from '../../components/Common/Label'
import SubLabel from '../../components/Common/SubLabel'
import Text from '../../components/Common/Text/Text'
import ErrorMessage from '../../components/Error/ErrorMessage'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import CoAuthors from '../../components/Proposal/Submit/CoAuthor/CoAuthors'
import LogIn from '../../components/User/LogIn'
import { NewProposalCatalyst, newProposalCatalystScheme } from '../../entities/Proposal/types'
import { isAlreadyACatalyst, isValidDomainName } from '../../entities/Proposal/utils'
import locations from '../../utils/locations'

import './catalyst.css'
import './submit.css'

const initialState: NewProposalCatalyst = {
  owner: '',
  domain: '',
  description: '',
}
const schema = newProposalCatalystScheme.properties

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
  } = useForm<NewProposalCatalyst>({ defaultValues: initialState, mode: 'onTouched' })
  const [error, setError] = useState('')
  const [domain, setDomain] = useState('')

  const { isLoading: isCommsStatusLoading, isError: isErrorOnCommsStatus } = useQuery({
    queryKey: [`commsStatus#${domain}`],
    queryFn: () => (domain ? Catalyst.from('https://' + domain).getCommsStatus() : null),
  })
  const { isLoading: isContentStatusLoading, isError: isErrorOnContentStatus } = useQuery({
    queryKey: [`contentStatus#${domain}`],
    queryFn: () => (domain ? Catalyst.from('https://' + domain).getContentStatus() : null),
  })
  const { isLoading: isLambdasStatusLoading, isError: isErrorOnLambdasStatus } = useQuery({
    queryKey: [`lambdasStatus#${domain}`],
    queryFn: () => (domain ? Catalyst.from('https://' + domain).getLambdasStatus() : null),
  })

  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)

  useEffect(() => {
    if (!errors.domain && (isErrorOnCommsStatus || isErrorOnContentStatus || isErrorOnLambdasStatus)) {
      setFormError('domain', { message: t('error.catalyst.server_invalid_status') })
    }
  }, [isErrorOnCommsStatus, isErrorOnContentStatus, isErrorOnLambdasStatus, errors.domain, setFormError, t])

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<NewProposalCatalyst> = async (data) => {
    const errors = [isErrorOnCommsStatus, isErrorOnContentStatus, isErrorOnLambdasStatus].filter(Boolean)
    if (errors.length > 0) {
      setFormError('domain', { message: t('error.catalyst.server_invalid_status') })
      setError('error.catalyst.server_invalid_status')

      return
    }

    const loading = [isCommsStatusLoading, isContentStatusLoading, isLambdasStatusLoading].filter(Boolean)
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
          <Text size="lg">{t('page.submit_catalyst.description')}</Text>
          <Text size="lg">{t('page.submit_catalyst.description_2')}</Text>
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
              <Text>
                {isCommsStatusLoading && (
                  <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_comms_checking')}</span>
                )}
                {isErrorOnCommsStatus && (
                  <span className="Catalyst__Error">{t('page.submit_catalyst.domain_comms_failed')}</span>
                )}
                {!isCommsStatusLoading && !isErrorOnCommsStatus && (
                  <span className="Catalyst__Success">{t('page.submit_catalyst.domain_comms_ok')}</span>
                )}
                {isContentStatusLoading && (
                  <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_content_checking')}</span>
                )}
                {isErrorOnContentStatus && (
                  <span className="Catalyst__Error">{t('page.submit_catalyst.domain_content_failed')}</span>
                )}
                {!isContentStatusLoading && !isErrorOnContentStatus && (
                  <span className="Catalyst__Success">{t('page.submit_catalyst.domain_content_ok')}</span>
                )}
                {isLambdasStatusLoading && (
                  <span className="Catalyst__Loading">{t('page.submit_catalyst.domain_lambda_checking')}</span>
                )}
                {isErrorOnLambdasStatus && (
                  <span className="Catalyst__Error">{t('page.submit_catalyst.domain_lambda_failed')}</span>
                )}
                {!isLambdasStatusLoading && !isErrorOnLambdasStatus && (
                  <span className="Catalyst__Success">{t('page.submit_catalyst.domain_lambda_ok')}</span>
                )}
              </Text>
            </div>
          )}
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_catalyst.description_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_catalyst.description_detail')}</SubLabel>
          <MarkdownField
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
          />
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button
            primary
            disabled={formDisabled || isCommsStatusLoading || isContentStatusLoading || isLambdasStatusLoading}
            loading={isSubmitting || isCommsStatusLoading || isContentStatusLoading || isLambdasStatusLoading}
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
