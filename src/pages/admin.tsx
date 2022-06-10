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
import { isValidName } from '../entities/Proposal/utils'
import useIsAdmin from '../hooks/useIsAdmin'

import './transparency.css'

type TestState = {
  name: string
}

const initialState: TestState = {
  name: '',
}

const edit = (state: TestState, props: Partial<TestState>) => {
  return {
    ...state,
    ...props,
  }
}

const validate = createValidator<TestState>({
  name: (state) => ({
    name:
      (state.name.length >= 2 && assert(isValidName(state.name), 'error.ban_name.name_invalid')) ||
      assert(state.name.length <= 4, 'error.ban_name.name_too_large'),
  }),
  '*': (state) => ({
    name:
      assert(state.name.length > 0, 'error.ban_name.name_empty') ||
      assert(state.name.length >= 2, 'error.ban_name.name_too_short') ||
      assert(state.name.length <= 4, 'error.ban_name.name_too_large'),
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
          return HttpStat.get().fetchResponse(state.value.name)
        })
        .then((result) => {
          console.log('result', result)
          setFormDisabled(false)
          editor.error({ '*': 'There was an error!' })
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
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
          <Label>{'Error type'}</Label>
          <Field
            value={state.value.name}
            onChange={(_, { value }) => editor.set({ name: value })}
            onBlur={() => editor.set({ name: state.value.name.trim() })}
            error={!!state.error.name}
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
