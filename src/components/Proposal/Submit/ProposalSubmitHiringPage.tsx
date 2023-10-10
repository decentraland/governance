import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import classNames from 'classnames'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import type { DropdownItemProps } from 'decentraland-ui'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { CommitteeName } from '../../../clients/DclData'
import { Governance } from '../../../clients/Governance'
import { SUBMISSION_THRESHOLD_HIRING } from '../../../entities/Proposal/constants'
import { HiringType, NewProposalHiring, newProposalHiringScheme } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useVotingPowerDistribution from '../../../hooks/useVotingPowerDistribution'
import locations, { navigate } from '../../../utils/locations'
import Field from '../../Common/Form/Field'
import MarkdownField from '../../Common/Form/MarkdownField'
import SubLabel from '../../Common/SubLabel'
import Label from '../../Common/Typography/Label'
import Text from '../../Common/Typography/Text'
import ErrorMessage from '../../Error/ErrorMessage'
import ContentLayout, { ContentSection } from '../../Layout/ContentLayout'
import LoadingView from '../../Layout/LoadingView'
import LogIn from '../../Layout/LogIn'

import CoAuthors from './CoAuthor/CoAuthors'

import CommitteeMembersDropdown from './CommitteeMembersDropdown'
import './ProposalSubmitHiringPage.css'

function getHiringTypeAction(hiringType: HiringType) {
  return hiringType.split('_')[1] as 'add' | 'remove'
}

interface Props {
  type: HiringType
  committees: CommitteeName[]
  isCommitteesLoading?: boolean
}

type HiringState = Omit<NewProposalHiring, 'type' | 'committee'> & { committee: CommitteeName | null }

const schema = newProposalHiringScheme.properties
const initialState: HiringState = {
  committee: null,
  address: '',
  reasons: '',
  evidence: '',
}

export default function ProposalSubmitHiringPage({ type, committees, isCommitteesLoading }: Props) {
  const [account, accountState] = useAuthContext()
  const preventNavigation = useRef(false)
  const action = getHiringTypeAction(type)
  const [formDisabled, setFormDisabled] = useState(false)
  const [error, setError] = useState('')
  const t = useFormatMessage()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(account)
  const submissionVpNotMet = useMemo(
    () => !!vpDistribution && vpDistribution.total < Number(SUBMISSION_THRESHOLD_HIRING),
    [vpDistribution]
  )

  useEffect(() => {
    setFormDisabled(submissionVpNotMet)
  }, [submissionVpNotMet])

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    control,
    setValue,
    clearErrors,
    watch,
  } = useForm<HiringState>({ defaultValues: initialState, mode: 'onTouched' })

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  const getTargetOptions = useCallback(() => {
    return committees.map((committee) => ({
      key: committee,
      value: committee,
      text: committee,
      onClick: () => {
        setValue('committee', committee)
        if (type === HiringType.Remove) {
          setValue('address', '')
        }
        clearErrors('committee')
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committees, setValue, type])

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<HiringState> = async (data) => {
    setFormDisabled(true)

    try {
      const proposal = await Governance.get().createProposalHiring({ type, ...data, committee: data.committee! })
      navigate(locations.proposal(proposal.id, { new: 'true' }), {
        replace: true,
      })
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  const handleRemoveMemberClick = (_: any, data: DropdownItemProps) => {
    setValue('address', data.value as string)
    setValue('name', data.text as string)
    clearErrors('address')
  }

  const title = t(`page.submit_hiring.${action}.title`)
  const description = t(`page.submit_hiring.${action}.description`)

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
          <Text size="lg">{description}</Text>
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
                  disabled={formDisabled || !!isCommitteesLoading}
                  error={!!errors.committee}
                  loading={!!isCommitteesLoading || isLoadingVpDistribution}
                />
              )}
            />
          </div>
          {type === HiringType.Add && (
            <span className="SubmitHiring__AddDetail">{t('page.submit_hiring.target_description')}</span>
          )}
        </ContentSection>
        <ContentSection className={classNames(type === HiringType.Add && 'SubmitHiring__AddressSection')}>
          <Label>{t(`page.submit_hiring.${action}.address_title`)}</Label>
          {type === HiringType.Add ? (
            <>
              <SubLabel>{t(`page.submit_hiring.add.address_description`)}</SubLabel>
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
                loading={isLoadingVpDistribution}
              />
            </>
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
                loading={isLoadingVpDistribution}
              />
            </div>
          )}
        </ContentSection>
        <ContentSection className="SubmitHiring__ReasonsSection">
          <Label>{t(`page.submit_hiring.${action}.reasons_title`)}</Label>
          <SubLabel>{t(`page.submit_hiring.${action}.reasons_description`)}</SubLabel>
          <MarkdownField
            control={control}
            name="reasons"
            rules={{
              required: { value: true, message: t('page.submit_hiring.error.reasons_required') },
              minLength: { value: schema.reasons.minLength, message: t('page.submit_hiring.error.reasons_min_length') },
              maxLength: { value: schema.reasons.maxLength, message: t('page.submit_hiring.error.reasons_max_length') },
            }}
            disabled={formDisabled}
            loading={isLoadingVpDistribution}
            error={!!errors.reasons}
            message={
              t(errors.reasons?.message) +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('reasons', '').length,
                limit: schema.reasons.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="SubmitHiring__EvidenceSection">
          <Label>{t(`page.submit_hiring.${action}.evidence_title`)}</Label>
          <SubLabel>{t(`page.submit_hiring.${action}.evidence_description`)}</SubLabel>
          <MarkdownField
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
            disabled={formDisabled}
            loading={isLoadingVpDistribution}
            error={!!errors.evidence}
            message={
              t(errors.evidence?.message) +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('evidence', '').length,
                limit: schema.evidence.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary disabled={formDisabled} loading={isLoadingVpDistribution || isSubmitting}>
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {!isLoadingVpDistribution && submissionVpNotMet && (
          <ContentSection>
            <Text size="lg" color="primary">
              {t('page.submit_hiring.error.submission_vp_not_met', { threshold: SUBMISSION_THRESHOLD_HIRING })}
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
