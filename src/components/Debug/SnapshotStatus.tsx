import React, { useEffect, useState } from 'react'

import fetch from 'isomorphic-fetch'

import { getQueryTimestamp } from '../../clients/SnapshotGraphql'
import { SNAPSHOT_SPACE } from '../../entities/Snapshot/constants'
import { getAMonthAgo } from '../../utils/date/aMonthAgo'
import Markdown from '../Common/Typography/Markdown'
import WarningTriangle from '../Icon/WarningTriangle'

import './SnapshotStatus.css'

async function pingSnapshot(): Promise<number> {
  const now = new Date()
  const startTime = now.getTime()
  try {
    const query = `
      query getVotes($space: String!, $start: Int!, $end: Int!, $first: Int!) {
        votes(where: {space: $space, created_gte: $start, created_lt: $end}, orderBy: "created", orderDirection: asc, first: $first) {
          id
          voter
          created
          vp
          choice
          proposal {
            id
            choices
          }
        }
      }
    `

    await fetch('https://hub.snapshot.org/graphql/', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          space: SNAPSHOT_SPACE,
          first: 10,
          start: getQueryTimestamp(getAMonthAgo(now).getTime()), //TODO: find significant timestamp
          end: getQueryTimestamp(now.getTime()),
        },
      }),
    })

    const endTime = new Date().getTime()
    return endTime - startTime
  } catch (error) {
    return -1 // Return -1 to indicate API failure
  }
}

type ServiceStatus = 'normal' | 'slow' | 'failing'

const SLOW_RESPONSE_TIME_THRESHOLD = 500
const PING_INTERVAL = 5000

export default function SnapshotStatus() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('normal')
  const [showStatusBar, setShowStatusBar] = useState(false)

  const updateServiceStatus = async () => {
    const responseTime = await pingSnapshot()
    console.log('responseTime', responseTime)
    let currentStatus: ServiceStatus = 'normal'
    if (responseTime === -1) {
      currentStatus = 'failing'
    } else if (responseTime > SLOW_RESPONSE_TIME_THRESHOLD) {
      currentStatus = 'slow'
    }
    console.log('serviceStatus', currentStatus)
    setServiceStatus(currentStatus)
  }

  useEffect(() => {
    const intervalId = setInterval(updateServiceStatus, PING_INTERVAL)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      {(serviceStatus === 'failing' || serviceStatus === 'slow') && (
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
