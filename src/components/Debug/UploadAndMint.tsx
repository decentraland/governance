import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../../clients/Governance'
import useFormatMessage from '../../hooks/useFormatMessage'
import Field from '../Common/Form/Field'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import Text from '../Common/Typography/Text'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

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

export default function UploadAndMint({ className }: Props) {
  const t = useFormatMessage()
  const [formDisabled, setFormDisabled] = useState(false)
  const [error, setError] = useState('')
  const [badgeCid, setBadgeCid] = useState<string | undefined>()
  const [result, setResult] = useState<string | null>()

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    watch,
  } = useForm<SpecState>({ defaultValues: initialState, mode: 'onTouched' })

  const onSubmit: SubmitHandler<SpecState> = async (data) => {
    setFormDisabled(true)
    setResult(null)
    setError('')
    console.log('submitting data', JSON.stringify(data))
    try {
      const result: any = await Governance.get().uploadAndMint(data)
      console.log('result', result)
      setResult(JSON.stringify(result))
      setBadgeCid(result)
      setFormDisabled(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err, { ...err })
      setError(err.body?.error || err.message)
      setFormDisabled(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Heading size="xs">{'Upload & Mint'}</Heading>
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
          <Field
            name="expiresAt"
            control={control}
            error={!!errors.expiresAt}
            disabled={formDisabled}
            message={errors.expiresAt?.message}
            rules={{
              required: { value: true, message: 'Expiration date name cannot be empty' },
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

        <Button type="submit" className="Debug__SectionButton" primary disabled={formDisabled} loading={isSubmitting}>
          {'Upload Spec'}
        </Button>
        {result && (
          <>
            <Label>{'Result'}</Label>
            <Text className="Debug__Result">{watch('title')}</Text>
          </>
        )}
        {error && (
          <ContentSection>
            <ErrorMessage label={t('page.debug.error_label')} errorMessage={t(error) || error} />
          </ContentSection>
        )}
      </form>
    </div>
  )
}
