import React, { useEffect, useState } from 'react'
import Helmet from 'react-helmet'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { HttpStat } from '../api/HttpStat'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import LogIn from '../components/User/LogIn'
import useIsAdmin from '../hooks/useIsAdmin'

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
    httpStatus: assert(state.httpStatus.length === 3, 'error.admin.invalid_http_status'),
  }),
  sleepTime: (state) => ({
    sleepTime: assert(state.sleepTime >= 0 && state.sleepTime <= MAX_SLEEP_TIME, 'error.admin.invalid_sleep_time'),
  }),
  '*': (state) => ({
    httpStatus: assert(state.httpStatus.length === 3, 'error.admin.invalid_http_status'),
    sleepTime: assert(state.sleepTime >= 0 && state.sleepTime <= MAX_SLEEP_TIME, 'error.admin.invalid_sleep_time'),
  }),
})

export default function WrappingPage() {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { isAdmin } = useIsAdmin(account)
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
          editor.error({ '*': 'There was an error, please try again.' })
          setFormDisabled(false)
        })
    }
  }, [editor, state.validated, state.value])

  if (!account || !isAdmin) {
    return <LogIn title={'test'} description={'test'} />
  }

  return (
    <>
      <Navigation activeTab={NavigationTab.Admin} />
      <ContentLayout small>
        <ContentSection>
          <Header size="huge">{t('page.admin.title')}</Header>
          <Head
            title={t('page.admin.title') || ''}
            description={t('page.admin.description') || ''}
            image="https://decentraland.org/images/decentraland.png"
          />
          <Helmet title={t('page.admin.title') || ''} />
        </ContentSection>
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
        <ContentSection>
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
            <Paragraph small primary>
              {t(state.error['*']) || state.error['*']}
            </Paragraph>
          </ContentSection>
        )}
      </ContentLayout>
    </>
  )
}
