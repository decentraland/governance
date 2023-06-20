import React, { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import {
  CANDIDATE_ADDRESSES,
  DAO_DISCORD_URL,
  DOCS_URL,
  FORUM_URL,
  GOVERNANCE_API,
  LOCAL_ENV_VAR,
  NEWSLETTER_URL,
  OPEN_CALL_FOR_DELEGATES_LINK,
  PROD_ENV_VAR,
  ROLLBAR_TOKEN,
  SEGMENT_KEY,
  TEST_ENV_VAR,
} from '../../constants'
import Label from '../Common/Label'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

const CONSTANTS: Record<string, any> = {
  DOCS_URL: DOCS_URL,
  FORUM_URL: FORUM_URL,
  GOVERNANCE_API: GOVERNANCE_API,
  DAO_DISCORD_URL: DAO_DISCORD_URL,
  NEWSLETTER_URL: NEWSLETTER_URL,
  OPEN_CALL_FOR_DELEGATES_LINK: OPEN_CALL_FOR_DELEGATES_LINK,
  CANDIDATE_ADDRESSES: CANDIDATE_ADDRESSES,
  ROLLBAR_TOKEN: ROLLBAR_TOKEN,
  SEGMENT_KEY: SEGMENT_KEY,
  LOCAL_ENV_VAR: LOCAL_ENV_VAR,
  TEST_ENV_VAR: TEST_ENV_VAR,
  PROD_ENV_VAR: PROD_ENV_VAR,
}

export default function EnvStatus({ className }: Props) {
  const [envName, setEnvName] = useState<string>('')
  const [envValue, setEnvValue] = useState<any>()
  const [errorMessage, setErrorMessage] = useState<any>()

  async function handleReadVar() {
    setErrorMessage('')
    try {
      console.log('constants', CONSTANTS)
      console.log('constantsEnvValue', CONSTANTS[envName])
      setEnvValue(JSON.stringify(CONSTANTS[envName]))
      setErrorMessage('')
    } catch (e: any) {
      setErrorMessage(e.message)
    }
  }

  return (
    <div className={className}>
      <ContentSection>
        <Label>{'Frontend Env Variable'}</Label>
        <div className="EnvName__Section">
          <Field value={envName} onChange={(_, { value }) => setEnvName(value)} />
          <Button className="Debug__SectionButton" primary disabled={!envName} onClick={() => handleReadVar()}>
            {'Read Env Var'}
          </Button>
        </div>
        <Field value={envValue} disabled />
      </ContentSection>
      {!!errorMessage && <ErrorMessage label={'Env Var Error'} errorMessage={errorMessage} />}
    </div>
  )
}
