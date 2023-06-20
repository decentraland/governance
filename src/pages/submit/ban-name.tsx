import React, { useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { SubmitHandler, useForm } from 'react-hook-form'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

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
import { NewProposalBanName, newProposalBanNameScheme } from '../../entities/Proposal/types'
import { isAlreadyBannedName, isValidName } from '../../entities/Proposal/utils'
import locations from '../../utils/locations'

import './submit.css'

const initialState: NewProposalBanName = {
  name: '',
  description: '',
}

const schema = newProposalBanNameScheme.properties

export default function SubmitBanName() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    watch,
  } = useForm<NewProposalBanName>({ defaultValues: initialState, mode: 'onTouched' })
  const [error, setError] = useState('')

  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<NewProposalBanName> = async (data) => {
    setFormDisabled(true)

    try {
      if (await isAlreadyBannedName(data.name)) {
        throw new Error('error.ban_name.name_already_banned')
      }

      const proposal = await Governance.get().createProposalBanName(data)
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
      <LogIn title={t('page.submit_ban_name.title') || ''} description={t('page.submit_ban_name.description') || ''} />
    )
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_ban_name.title') || ''}
        description={t('page.submit_ban_name.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_ban_name.title') || ''} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_ban_name.title')}</Header>
        </ContentSection>
        <ContentSection>
          <Text size="lg">{t('page.submit_ban_name.description')}</Text>
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_ban_name.name_label')}</Label>
          <Field
            name="name"
            control={control}
            error={!!errors.name}
            rules={{
              required: { value: true, message: t('error.ban_name.name_empty') },
              validate: (name: string) => {
                if (!isValidName(name)) {
                  return t('error.ban_name.name_invalid')
                }
              },
              minLength: {
                value: schema.name.minLength,
                message: t('error.ban_name.name_too_short'),
              },
              maxLength: {
                value: schema.name.maxLength,
                message: t('error.ban_name.name_too_large'),
              },
            }}
            message={
              t(errors.name?.message) +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('name').length,
                limit: schema.name.maxLength,
              })
            }
            disabled={formDisabled}
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_ban_name.description_label')}
            <MarkdownNotice />
          </Label>
          <SubLabel>{t('page.submit_ban_name.description_detail')}</SubLabel>
          <MarkdownField
            control={control}
            name="description"
            rules={{
              required: { value: true, message: t('error.ban_name.description_empty') },
              minLength: {
                value: schema.description.minLength,
                message: t('error.ban_name.description_too_short'),
              },
              maxLength: {
                value: schema.description.maxLength,
                message: t('error.ban_name.description_too_large'),
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
          <Button primary type="submit" disabled={formDisabled} loading={isSubmitting}>
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
