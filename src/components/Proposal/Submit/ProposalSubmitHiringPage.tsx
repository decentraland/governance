import React, { useCallback, useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import type { DropdownItemProps } from 'decentraland-ui'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Committees } from '../../../clients/DclData'
import { HiringType, getHiringTypeAction, newProposalHiringScheme } from '../../../entities/Proposal/types'
import Field from '../../Common/Form/Field'
import SubLabel from '../../Common/SubLabel'
import ErrorMessage from '../../Error/ErrorMessage'
import ContentLayout, { ContentSection } from '../../Layout/ContentLayout'

import CoAuthors from './CoAuthor/CoAuthors'

import CommitteeMembersDropdown from './CommitteeMembersDropdown'
import './ProposalSubmitHiringPage.css'

interface Props {
  type: HiringType
}

type HiringState = {
  committee: Committees | null
  address: string
  reasons: string
  evidence: string
  coAuthors?: string[]
}

const schema = newProposalHiringScheme.properties
const initialState: HiringState = {
  committee: null,
  address: '',
  reasons: '',
  evidence: '',
}

function ProposalSubmitHiringPage({ type }: Props) {
  const preventNavigation = useRef(false)
  const action = getHiringTypeAction(type)
  const [formDisabled, setFormDisabled] = useState(false)
  const [error, setError] = useState('')
  const t = useFormatMessage()

  const {
    handleSubmit,
    formState: { isDirty, errors },
    control,
    setValue,
    clearErrors,
    watch,
  } = useForm<HiringState>({ defaultValues: initialState })

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  const getTargetOptions = useCallback(() => {
    return Object.entries(Committees).map(([key, committee]) => ({
      key,
      value: committee,
      text: committee,
      onClick: () => {
        setValue('committee', committee)
        clearErrors('committee')
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue])

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<HiringState> = async (data) => {
    setFormDisabled(true)

    try {
      console.log(data)
      throw new Error('Not implemented yet')
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  const handleRemoveMemberClick = (_: any, data: DropdownItemProps) => {
    setValue('address', data.value as string)
    clearErrors('address')
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t(`page.submit_hiring.${action}.title`) || ''}
        description={t('page.submit_hiring.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t(`page.submit_hiring.${action}.title`) || ''} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t(`page.submit_hiring.${action}.title`)}</Header>
        </ContentSection>
        <ContentSection>
          <Paragraph small>{t('page.submit_hiring.description')}</Paragraph>
        </ContentSection>
        <ContentSection>
          <Label>{t('page.submit_hiring.target_title')}</Label>
          <div className="SubmitHiring__DropdownContainer">
            <Controller
              control={control}
              name="committee"
              rules={{
                required: { value: true, message: '' },
              }}
              render={() => (
                <Dropdown
                  placeholder={t('page.submit_hiring.target_placeholder')}
                  fluid
                  selection
                  options={getTargetOptions()}
                  disabled={formDisabled}
                  error={!!errors.committee}
                />
              )}
            />
          </div>
          {type === HiringType.Add && (
            <span className="SubmitHiring__AddDetail">{t('page.submit_hiring.target_description')}</span>
          )}
        </ContentSection>
        <ContentSection className={TokenList.join([type === HiringType.Add && 'SubmitHiring__AddressSection'])}>
          <Label>{t(`page.submit_hiring.${action}.address_title`)}</Label>
          {type === HiringType.Add ? (
            <Field
              control={control}
              name="address"
              rules={{
                required: { value: true, message: t('page.submit_hiring.error.address_invalid') },
                validate: (value: string) => {
                  if (!isEthereumAddress(value)) {
                    return t('page.submit_hiring.error.address_invalid')
                  }
                },
              }}
              type="string"
              placeholder={t('page.submit_hiring.address_placeholder')}
              error={!!errors.address}
              disabled={formDisabled}
              message={errors.address?.message}
            />
          ) : (
            <div className="SubmitHiring__DropdownContainer">
              <CommitteeMembersDropdown
                control={control}
                name="address"
                rules={{
                  required: { value: true, message: '' },
                }}
                committee={watch('committee')}
                disabled={formDisabled}
                error={!!errors.address}
                onOptionClick={handleRemoveMemberClick}
              />
            </div>
          )}
        </ContentSection>
        <ContentSection className="SubmitHiring__ReasonsSection">
          <Label>{t(`page.submit_hiring.${action}.reasons_title`)}</Label>
          <SubLabel>{t(`page.submit_hiring.${action}.reasons_description`)}</SubLabel>
          <Controller
            control={control}
            name="reasons"
            rules={{
              required: { value: true, message: t('page.submit_hiring.error.reasons_required') },
              minLength: { value: schema.reasons.minLength, message: t('page.submit_hiring.error.reasons_min_length') },
              maxLength: { value: schema.reasons.maxLength, message: t('page.submit_hiring.error.reasons_max_length') },
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, onChange, onBlur, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                disabled={formDisabled}
                onChange={(_: unknown, { value }: { value: string }) => setValue('reasons', value)}
                onBlur={() => clearErrors('reasons')}
                error={!!errors.reasons}
                message={
                  t(errors.reasons?.message) +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('reasons', '').length,
                    limit: schema.reasons.maxLength,
                  })
                }
                {...field}
              />
            )}
          />
        </ContentSection>
        <ContentSection className="SubmitHiring__EvidenceSection">
          <Label>{t(`page.submit_hiring.${action}.evidence_title`)}</Label>
          <SubLabel>{t(`page.submit_hiring.${action}.evidence_description`)}</SubLabel>
          <Controller
            control={control}
            name="evidence"
            rules={{
              required: { value: true, message: t('page.submit_hiring.error.evidence_required') },
              minLength: {
                value: schema.evidence.minLength,
                message: t('page.submit_hiring.error.evidence_min_length'),
              },
              maxLength: {
                value: schema.evidence.maxLength,
                message: t('page.submit_hiring.error.evidence_max_length'),
              },
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, onChange, onBlur, ...field } }) => (
              <MarkdownTextarea
                minHeight={175}
                disabled={formDisabled}
                onChange={(_: unknown, { value }: { value: string }) => setValue('evidence', value)}
                onBlur={() => clearErrors('evidence')}
                error={!!errors.evidence}
                message={
                  t(errors.evidence?.message) +
                  ' ' +
                  t('page.submit.character_counter', {
                    current: watch('evidence', '').length,
                    limit: schema.evidence.maxLength,
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
          <Button type="submit" primary disabled={formDisabled} loading={false} onClick={() => ({})}>
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

export default ProposalSubmitHiringPage
