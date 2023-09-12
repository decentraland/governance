import React, { useEffect, useState } from 'react'

import classNames from 'classnames'

import { Governance } from '../../clients/Governance'
import { ServiceHealth } from '../../clients/SnapshotTypes'
import useFormatMessage from '../../hooks/useFormatMessage'
import Markdown from '../Common/Typography/Markdown'
import WarningTriangle from '../Icon/WarningTriangle'

import './SnapshotStatus.css'

const PING_INTERVAL_IN_MS = 5000 // 5 seconds

export default function SnapshotStatus() {
  const t = useFormatMessage()
  const [showTopBar, setShowTopBar] = useState(false)

  const updateServiceStatus = async () => {
    const status = await Governance.get().getSnapshotStatus()
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
          {t('page.debug.snapshot_status.label')}
        </Markdown>
      </div>
    </>
  )
}
