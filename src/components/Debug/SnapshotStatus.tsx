import React, { useState } from 'react'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { SNAPSHOT_SPACE } from '../../entities/Snapshot/constants'
import { getSnapshotStatusAndSpace } from '../../entities/Snapshot/utils'
import ErrorMessage from '../Error/ErrorMessage'
import MarkdownField from '../Form/MarkdownField'
import { ContentSection } from '../Layout/ContentLayout'

import './SnapshotStatus.css'

interface Props {
  className?: string
}

export default function SnapshotStatus({ className }: Props) {
  const [spaceName, setSpaceName] = useState(SNAPSHOT_SPACE)
  const [snapshotStatus, setSnapshotStatus] = useState<any>()
  const [snapshotSpace, setSnapshotSpace] = useState<any>()
  const [errorMessage, setErrorMessage] = useState<any>()

  async function handleFetchClick() {
    setErrorMessage('')
    console.log('spaceName', spaceName)
    try {
      const { snapshotStatus: newStatus, snapshotSpace: newSpace } = await getSnapshotStatusAndSpace(spaceName)
      setSnapshotStatus(newStatus)
      setSnapshotSpace(newSpace)
      setErrorMessage('')
    } catch (e: any) {
      console.log('e', e)
      setErrorMessage(e.message)
    }
  }

  return (
    <div className={className}>
      <ContentSection>
        <Label>{'Space Name'}</Label>
        <div className="SpaceName__Section">
          <Field value={spaceName} onChange={(_, { value }) => setSpaceName(value)} />
          <Button className="SpaceName__SectionButton" primary disabled={!spaceName} onClick={() => handleFetchClick()}>
            {'Fetch Status & Space'}
          </Button>
        </div>
      </ContentSection>
      <MarkdownField
        showMarkdownNotice={false}
        label="Snapshot Status"
        readOnly={true}
        minHeight={77}
        value={JSON.stringify(snapshotStatus)}
        preview={true}
      />
      <MarkdownField
        showMarkdownNotice={false}
        label="Snapshot Space"
        readOnly={true}
        minHeight={77}
        value={JSON.stringify(snapshotSpace)}
        preview={true}
      />
      {!!errorMessage && <ErrorMessage label={'Snapshot Error'} errorMessage={errorMessage} />}
    </div>
  )
}
