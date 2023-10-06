import { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { ErrorClient } from '../../clients/ErrorClient'
import Heading from '../Common/Typography/Heading'
import Label from '../Common/Typography/Label'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

export default function ErrorReporting({ className }: Props) {
  const [message, setMessage] = useState<string>('')
  const [errorData, setErrorData] = useState<string>('{}')
  const [errorMessage, setErrorMessage] = useState<any>()
  const [formDisabled, setFormDisabled] = useState(false)

  async function reportError() {
    setErrorMessage('')
    setFormDisabled(true)
    try {
      await ErrorClient.report(message, JSON.parse(errorData))
    } catch (e: any) {
      setErrorMessage(e.message)
    }
    setFormDisabled(false)
  }

  return (
    <div className={className}>
      <ContentSection>
        <Heading size="sm">{'Report Error to Server'}</Heading>
        <div>
          <Label>{'Error Message'}</Label>
          <Field value={message} onChange={(_, { value }) => setMessage(value)} />
          <Label>{'JSON data'}</Label>
          <Field value={errorData} onChange={(_, { value }) => setErrorData(value)} />
          <Button
            className="Debug__SectionButton"
            primary
            disabled={!message || formDisabled}
            onClick={() => reportError()}
          >
            {'Report Error'}
          </Button>
        </div>
      </ContentSection>
      {!!errorMessage && <ErrorMessage label={'Error trying to report error'} errorMessage={errorMessage} />}
    </div>
  )
}
