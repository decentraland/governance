import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { HttpStat } from '../../clients/HttpStat'
import useFormatMessage from '../../hooks/useFormatMessage'
import Field from '../Common/Form/Field'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

type TestState = {
  httpStatus: string
  sleepTime: number
}

const initialState: TestState = {
  httpStatus: '',
  sleepTime: 0,
}

const MAX_SLEEP_TIME = 300000 // 5 minutes

interface Props {
  className?: string
}

export default function HttpStatus({ className }: Props) {
  const t = useFormatMessage()
  const [formDisabled, setFormDisabled] = useState(false)
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = useForm<TestState>({ defaultValues: initialState, mode: 'onTouched' })
  const [error, setError] = useState('')

  const onSubmit: SubmitHandler<TestState> = async (data) => {
    try {
      const result = await HttpStat.fetchResponse(data.httpStatus, data.sleepTime)
      console.log('result', result)
      setFormDisabled(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err, { ...err })
      setError(err.body?.error || err.message)
      setFormDisabled(false)
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit(onSubmit)}>
      <ContentSection>
        <Heading size="sm">{'HTTP Status'}</Heading>
        <Label>{'Http Status'}</Label>
        <Field
          name="httpStatus"
          control={control}
          error={!!errors.httpStatus}
          message={errors.httpStatus?.message}
          disabled={formDisabled}
          rules={{
            required: { value: true, message: t('error.draft.title_empty') },
            validate: (value: string) => {
              if (value.length !== 3) {
                return t('error.debug.invalid_http_status')
              }
            },
          }}
        />
      </ContentSection>
      <ContentSection>
        <Label>{'Sleep'}</Label>
        <Field
          name="sleepTime"
          control={control}
          error={!!errors.sleepTime}
          message={errors.sleepTime?.message}
          disabled={formDisabled}
          rules={{
            required: { value: true, message: t('error.draft.title_empty') },
            validate: (value: string) => {
              if (Number(value) < 0 || Number(value) > MAX_SLEEP_TIME) {
                return t('error.debug.invalid_sleep_time')
              }
            },
          }}
        />
      </ContentSection>
      <ContentSection className="DebugPage__Submit">
        <Button type="submit" primary disabled={formDisabled} loading={isSubmitting}>
          {t('page.submit.button_submit')}
        </Button>
      </ContentSection>
      {error && (
        <ContentSection>
          <ErrorMessage label={t('page.debug.error_label')} errorMessage={t(error) || error} />
        </ContentSection>
      )}
    </form>
  )
}
