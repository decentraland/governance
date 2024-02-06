import { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../../../clients/Governance'
import Field from '../../../components/Common/Form/Field'
import MarkdownField from '../../../components/Common/Form/MarkdownField'
import SubLabel from '../../../components/Common/SubLabel'
import Label from '../../../components/Common/Typography/Label'
import Text from '../../../components/Common/Typography/Text'
import ErrorMessage from '../../../components/Error/ErrorMessage'
import MarkdownNotice from '../../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../../components/Layout/ContentLayout'
import LoadingView from '../../../components/Layout/LoadingView'
import CoAuthors from '../../../components/Proposal/Submit/CoAuthor/CoAuthors'
import {
  CatalystType,
  NewProposalCatalyst,
  ProposalType,
  newProposalCatalystScheme,
} from '../../../entities/Proposal/types'
import { isAlreadyACatalyst, isValidDomainName } from '../../../entities/Proposal/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import locations, { navigate } from '../../../utils/locations'
import Head from '../../Layout/Head'
import LogIn from '../../Layout/LogIn'

import './ProposalSubmitCatalystPage.css'

const initialState: Omit<NewProposalCatalyst, 'type'> = {
  owner: '',
  domain: '',
  description: '',
}
const schema = newProposalCatalystScheme.properties

interface Props {
  catalystType: CatalystType
}

function formatDomain(domain: string) {
  return domain.startsWith('https://') ? domain : `https://${domain}`
}

export default function ProposalSubmitCatalystPage({ catalystType }: Props) {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    watch,
    setError: setFormError,
    clearErrors,
  } = useForm<NewProposalCatalyst>({ defaultValues: initialState, mode: 'onTouched' })
  const [error, setError] = useState('')
  const [domain, setDomain] = useState('')

  const { isLoading: isContentStatusLoading, isError: isErrorOnContentStatus } = useQuery({
    queryKey: [`contentStatus#${domain}`],
    queryFn: async () => {
      if (!domain) {
        return null
      }

      const response = await fetch(`${formatDomain(domain)}/content/status`)
      return response.ok ? response : null
    },
  })
  const { isLoading: isLambdasStatusLoading, isError: isErrorOnLambdasStatus } = useQuery({
    queryKey: [`lambdasStatus#${domain}`],
    queryFn: async () => {
      if (!domain) {
        return null
      }

      const response = await fetch(`${formatDomain(domain)}/lambdas/status`)
      return response.ok ? response : null
    },
  })

  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)

  useEffect(() => {
    if (!errors.domain && (isErrorOnContentStatus || isErrorOnLambdasStatus)) {
      setFormError('domain', { message: t('error.catalyst.server_invalid_status') })
    }
  }, [isErrorOnContentStatus, isErrorOnLambdasStatus, errors.domain, setFormError, t])

  useEffect(() => {
    if (
      errors.domain &&
      !isErrorOnContentStatus &&
      !isErrorOnLambdasStatus &&
      !isLambdasStatusLoading &&
      !isContentStatusLoading
    ) {
      clearErrors('domain')
    }
  }, [
    isErrorOnContentStatus,
    isErrorOnLambdasStatus,
    errors.domain,
    clearErrors,
    isLambdasStatusLoading,
    isContentStatusLoading,
  ])

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<NewProposalCatalyst> = async (data) => {
    const errors = [isErrorOnContentStatus, isErrorOnLambdasStatus].filter(Boolean)
    if (errors.length > 0) {
      setFormError('domain', { message: t('error.catalyst.server_invalid_status') })
      setError('error.catalyst.server_invalid_status')

      return
    }

    const loading = [isContentStatusLoading, isLambdasStatusLoading].filter(Boolean)
    if (loading.length > 0) {
      return
    }

    setFormDisabled(true)

    try {
      const isDomainAlreadyACatalyst = isAlreadyACatalyst(data.domain)
      if (catalystType === CatalystType.Add && isDomainAlreadyACatalyst) {
        throw new Error('error.catalyst.domain_already_a_catalyst')
      }

      if (catalystType === CatalystType.Remove && !isDomainAlreadyACatalyst) {
        throw new Error('error.catalyst.domain_not_a_catalyst')
      }

      const proposal = await Governance.get().createProposalCatalyst({ ...data, type: catalystType })
      navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  const title = t(`page.submit_catalyst.${catalystType}.title`)
  const description = t(`page.submit_catalyst.${catalystType}.description`)

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={title} description={description} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={title}
        description={description}
        links={[{ rel: 'canonical', href: locations.submit(ProposalType.Catalyst, { request: catalystType }) }]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{title}</Header>
        </ContentSection>
        <ContentSection>
          <Text size="lg">{description}</Text>
          <Text size="lg">{t(`page.submit_catalyst.${catalystType}.description_2`)}</Text>
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
          <SubLabel>{t(`page.submit_catalyst.${catalystType}.description_detail`)}</SubLabel>
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
            type="submit"
            primary
            disabled={formDisabled || isContentStatusLoading || isLambdasStatusLoading}
            loading={isSubmitting}
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
