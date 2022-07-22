import React, { useEffect, useState } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { HttpStat } from '../api/HttpStat'
import ErrorMessage from '../components/Error/ErrorMessage'
import { ContentSection } from '../components/Layout/ContentLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import LogIn from '../components/User/LogIn'
import useIsDebugAddress from '../hooks/useIsDebugAddress'

import './debug.css'

type TestState = {
  httpStatus: string
  sleepTime: number
}

const initialState: TestState = {
  httpStatus: '',
  sleepTime: 0,
}

const edit = (state: TestState, props: Partial<TestState>) => {
  return {
    ...state,
    ...props,
  }
}

const MAX_SLEEP_TIME = 300000 // 5 minutes

const validate = createValidator<TestState>({
  httpStatus: (state) => ({
    httpStatus: assert(state.httpStatus.length === 3, 'error.debug.invalid_http_status'),
  }),
  sleepTime: (state) => ({
    sleepTime: assert(state.sleepTime >= 0 && state.sleepTime <= MAX_SLEEP_TIME, 'error.debug.invalid_sleep_time'),
  }),
  '*': (state) => ({
    httpStatus: assert(state.httpStatus.length === 3, 'error.debug.invalid_http_status'),
    sleepTime: assert(state.sleepTime >= 0 && state.sleepTime <= MAX_SLEEP_TIME, 'error.debug.invalid_sleep_time'),
  }),
})

export default function WrappingPage() {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { isDebugAddress } = useIsDebugAddress(account)
  const [state, editor] = useEditor(edit, validate, initialState)
  const [formDisabled, setFormDisabled] = useState(false)

  useEffect(() => {
    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          return HttpStat.get().fetchResponse(state.value.httpStatus, state.value.sleepTime)
        })
        .then((result) => {
          console.log('result', result)
          editor.error({ '*': '' })
          setFormDisabled(false)
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
          setFormDisabled(false)
        })
    }
  }, [editor, state.validated, state.value])

  if (!account || !isDebugAddress) {
    return <LogIn title={'test'} description={'test'} />
  }

  return (
    <Container className="DebugPage">
      <Navigation activeTab={NavigationTab.Debug} />
      <Header size="huge">{t('page.debug.title')}</Header>
      <ContentSection>
        <Label>{'Http Status'}</Label>
        <Field
          value={state.value.httpStatus}
          onChange={(_, { value }) => editor.set({ httpStatus: value })}
          onBlur={() => editor.set({ httpStatus: state.value.httpStatus.trim() })}
          error={!!state.error.httpStatus}
          disabled={formDisabled}
          message={t(state.error.httpStatus)}
        />
      </ContentSection>
      <ContentSection>
        <Label>{'Sleep'}</Label>
        <Field
          value={state.value.sleepTime}
          onChange={(_, { value }) => editor.set({ sleepTime: value ? Number(value) : undefined })}
          onBlur={() => editor.set({ sleepTime: state.value.sleepTime })}
          error={!!state.error.sleepTime}
          message={t(state.error.sleepTime)}
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection className="DebugPage__Submit">
        <Button
          primary
          disabled={state.validated || formDisabled}
          loading={state.validated || formDisabled}
          onClick={() => editor.validate()}
        >
          {t('page.submit.button_submit')}
        </Button>
      </ContentSection>
      {state.error['*'] && (
        <ContentSection>
          <ErrorMessage label={t('page.debug.error_label')} errorMessage={t(state.error['*']) || state.error['*']} />
        </ContentSection>
      )}
    </Container>
  )
}
