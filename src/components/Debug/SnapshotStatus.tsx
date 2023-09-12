import React, { useEffect, useState } from 'react'

import { Governance } from '../../clients/Governance'
import { ServiceHealth } from '../../clients/SnapshotTypes'
import Markdown from '../Common/Typography/Markdown'
import WarningTriangle from '../Icon/WarningTriangle'

import './SnapshotStatus.css'

const PING_INTERVAL = 5000

export default function SnapshotStatus() {
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth>(ServiceHealth.Normal)

  const updateServiceStatus = async () => {
    const status = await Governance.get().getSnapshotStatus()
    setServiceHealth(status.health)
  }

  useEffect(() => {
    const intervalId = setInterval(updateServiceStatus, PING_INTERVAL)
    return () => clearInterval(intervalId)
  }, [])

  const showTopBar = serviceHealth === ServiceHealth.Slow || serviceHealth === ServiceHealth.Failing
  return (
    <>
      {showTopBar && (
        <div className="SnapshotStatus__TopBar">
          <WarningTriangle size="18" />
          <Markdown size="sm" componentsClassNames={{ p: 'SnapshotStatus__Text', strong: 'SnapshotStatus__Text' }}>
            {'**Snapshot is failing.** Voting and creating proposals is currently unavailable.'}
          </Markdown>
        </div>
      )}
    </>
  )
}
