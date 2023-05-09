import React, { useState } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { Governance } from '../../clients/Governance'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}
function RemoveVerification({ className }: Props) {
  const [address, setAddress] = useState('')
  const [formDisabled, setFormDisabled] = useState(false)
  const [message, setMessage] = useState<unknown>()
  const handleClick = async () => {
    setFormDisabled(true)
    try {
      setMessage(await Governance.get().removeVerification(address))
    } catch (error) {
      console.error(error)
    }
    setFormDisabled(false)
  }
  return (
    <div className={className}>
      <ContentSection>
        <Label>{'Remove verification to a profile'}</Label>
        <div>
          <Field value={address} onChange={(_, { value }) => setAddress(value)} />
          <Button
            className="Debug__SectionButton"
            primary
            disabled={!address || formDisabled}
            onClick={() => handleClick()}
          >
            {'Delete verification'}
          </Button>
        </div>
        {!!message && <p>{String(message)}</p>}
      </ContentSection>
    </div>
  )
}

export default RemoveVerification
