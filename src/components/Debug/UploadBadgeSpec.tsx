import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field as DCLField } from 'decentraland-ui/dist/components/Field/Field'

import { getIpfsAddress } from '../../back/utils/contractInteractions'
import { Governance } from '../../clients/Governance'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import Field from '../Common/Form/Field'
import SubLabel from '../Common/SubLabel'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import Text from '../Common/Typography/Text'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

import './UploadBadgeSpec.css'

interface Props {
  className?: string
}

export type SpecState = {
  title: string
  description: string
  expiresAt?: string
  imgUrl: string
}

const initialState: SpecState = {
  imgUrl: '',
  description: '',
  expiresAt: '',
  title: '',
}

export default function UploadBadgeSpec({ className }: Props) {
  const t = useFormatMessage()
  const [formDisabled, setFormDisabled] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<any>()

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    setError,
    clearErrors,
    setValue,
  } = useForm<SpecState>({ defaultValues: initialState, mode: 'onTouched' })

  const onSubmit: SubmitHandler<SpecState> = async (data) => {
    setResult(null)
    setSubmitError('')
    setFormDisabled(true)
    try {
      const result: any = await Governance.get().uploadBadgeSpec(data)
      setResult(result)
      setFormDisabled(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err, { ...err })
      setSubmitError(err.body?.error || err.message)
      setFormDisabled(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Heading size="xs">{'Upload Badge Spec'}</Heading>
          <Label>{'Title'}</Label>
          <Field
            control={control}
            name="title"
            error={!!errors.title}
            message={errors.title?.message}
            disabled={formDisabled}
            rules={{
              required: { value: true, message: 'Title cannot be empty' },
            }}
          />

          <Label>{'Description'}</Label>
          <Field
            name="description"
            control={control}
            error={!!errors.description}
            message={errors.description?.message}
            disabled={formDisabled}
            rules={{
              required: { value: true, message: 'Description cannot be empty' },
            }}
          />
          <Label>{'Expiration Date'}</Label>
          <DCLField
            className="UploadAndMint__ExpirationDate"
            name="expiresAt"
            control={control}
            type="date"
            error={!!errors.expiresAt}
            message={errors.expiresAt?.message || ''}
            disabled={formDisabled}
            onChange={(_, { value }) => {
              clearErrors('expiresAt')
              if (Time(value).isBefore(Time())) {
                setError('expiresAt', { message: 'Expiration date needs to be in the future' })
              }
              setValue('expiresAt', value)
            }}
          />
          <Label>{'Image Url'}</Label>
          <Field
            name="imgUrl"
            control={control}
            error={!!errors.imgUrl}
            message={errors.imgUrl?.message}
            disabled={formDisabled}
            rules={{
              required: { value: true, message: 'Image url cannot be empty' },
            }}
          />
        </ContentSection>

        <div>
          <Button type="submit" className="Debug__SectionButton" primary disabled={formDisabled} loading={isSubmitting}>
            {'Upload Spec'}
          </Button>
        </div>
        {result && (
          <>
            <Label>{'Result'}</Label>
            <SubLabel>{'Badge Cid'}</SubLabel>
            <Text className="Debug__Result">{result.badgeCid}</Text>
            <SubLabel>{'IPFS Address'}</SubLabel>
            <Text className="Debug__Result">{getIpfsAddress(result.badgeCid)}</Text>
          </>
        )}
        {submitError && (
          <ContentSection>
            <ErrorMessage label={t('page.debug.error_label')} errorMessage={t(submitError) || submitError} />
          </ContentSection>
        )}
      </form>
    </div>
  )
}
