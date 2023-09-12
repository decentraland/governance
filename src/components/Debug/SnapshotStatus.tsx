import React, { useEffect, useState } from 'react'

import classNames from 'classnames'

import { Governance } from '../../clients/Governance'
import { ServiceHealth } from '../../clients/SnapshotTypes'
import Markdown from '../Common/Typography/Markdown'
import WarningTriangle from '../Icon/WarningTriangle'

import './SnapshotStatus.css'

const PING_INTERVAL_IN_MS = 5000 // 5 seconds

export default function SnapshotStatus() {
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth>(ServiceHealth.Normal)
  const [showTopBar, setShowTopBar] = useState(false) // Control bar visibility

  const updateServiceStatus = async () => {
    const status = await Governance.get().getSnapshotStatus()
    setServiceHealth(status.health)
    setShowTopBar(status.health === ServiceHealth.Slow || status.health === ServiceHealth.Failing)
  }

  useEffect(() => {
    const intervalId = setInterval(updateServiceStatus, PING_INTERVAL_IN_MS)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <div className={classNames(`SnapshotStatus__TopBar`, showTopBar && 'SnapshotStatus__TopBar--visible')}>
        <WarningTriangle size="18" />
        <Markdown size="sm" componentsClassNames={{ p: 'SnapshotStatus__Text', strong: 'SnapshotStatus__Text' }}>
          {'**Snapshot is failing.** Voting and creating proposals is currently unavailable.'}
        </Markdown>
      </div>
    </>
  )
}
