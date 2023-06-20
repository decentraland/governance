import React, { useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { Governance } from '../../clients/Governance'
import Label from '../Common/Label'
import ErrorMessage from '../Error/ErrorMessage'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

export default function ErrorReporting({ className }: Props) {
  const [message, setMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<any>()
  const [formDisabled, setFormDisabled] = useState(false)

  async function reportError() {
    setErrorMessage('')
    setFormDisabled(true)
    try {
      await Governance.get().reportErrorToServer(message)
    } catch (e: any) {
      setErrorMessage(e.message)
    }
    setFormDisabled(false)
  }

  return (
    <div className={className}>
      <ContentSection>
        <Label>{'Report Error to Server'}</Label>
        <div>
          <Field value={message} onChange={(_, { value }) => setMessage(value)} />
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
