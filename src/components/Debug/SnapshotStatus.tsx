import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { Governance } from '../../clients/Governance'
import { SNAPSHOT_SPACE } from '../../entities/Snapshot/constants'
import Label from '../Common/Typography/Label'
import ErrorMessage from '../Error/ErrorMessage'
import MarkdownFieldSection from '../Form/MarkdownFieldSection'
import { ContentSection } from '../Layout/ContentLayout'

interface Props {
  className?: string
}

export default function SnapshotStatus({ className }: Props) {
  const [spaceName, setSpaceName] = useState(SNAPSHOT_SPACE)
  const [snapshotStatus, setSnapshotStatus] = useState<any>()
  const [snapshotSpace, setSnapshotSpace] = useState<any>()
  const [errorMessage, setErrorMessage] = useState<any>()

  const { control } = useForm()

  async function handleFetchClick() {
    setErrorMessage('')
    try {
      const { status: newStatus, space: newSpace } = await Governance.get().getSnapshotStatusAndSpace(spaceName)
      setSnapshotStatus(newStatus)
      setSnapshotSpace(newSpace)
      setErrorMessage('')
    } catch (e: any) {
      setErrorMessage(e.message)
    }
  }

  return (
    <div className={className}>
      <ContentSection>
        <Label>{'Space Name'}</Label>
        <div className="SpaceName__Section">
          <Field value={spaceName} onChange={(_, { value }) => setSpaceName(value)} />
          <Button className="Debug__SectionButton" primary disabled={!spaceName} onClick={() => handleFetchClick()}>
            {'Fetch Status & Space'}
          </Button>
        </div>
      </ContentSection>
      <MarkdownFieldSection
        name="snapshotStatus"
        control={control}
        showMarkdownNotice={false}
        label="Snapshot Status"
        readOnly={true}
        minHeight={77}
        maxHeight={77}
        value={JSON.stringify(snapshotStatus)}
        preview={true}
      />
      <MarkdownFieldSection
        name="snapshotSpace"
        control={control}
        showMarkdownNotice={false}
        label="Snapshot Space"
        readOnly={true}
        minHeight={77}
        maxHeight={77}
        value={JSON.stringify(snapshotSpace)}
        preview={true}
      />
      {!!errorMessage && <ErrorMessage label={'Snapshot Error'} errorMessage={errorMessage} />}
    </div>
  )
}
