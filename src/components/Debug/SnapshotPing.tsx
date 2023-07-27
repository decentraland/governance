import React, { useEffect, useState } from 'react'

import { Toasts } from 'decentraland-ui'
import fetch from 'isomorphic-fetch'

import { getQueryTimestamp } from '../../clients/SnapshotGraphql'
import { SNAPSHOT_SPACE } from '../../entities/Snapshot/constants'
import Time from '../../utils/date/Time'
import SnapshotFailing from '../Icon/SnapshotFailing'
import SnapshotOk from '../Icon/SnapshotOk'
import SnapshotSlow from '../Icon/SnapshotSlow'
import { Toast, ToastType } from '../Toast/Toast'

async function pingSnapshot(): Promise<number> {
  const startTime = new Date().getTime()
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
          start: 1684534478, //TODO: find significant timestamp
          end: getQueryTimestamp(Time().getTime()),
        },
      }),
    })

    const endTime = new Date().getTime()
    return endTime - startTime
  } catch (error) {
    return -1 // Return -1 to indicate API failure
  }
}

const getToastType = (serviceStatus: ServiceStatus) => {
  switch (serviceStatus) {
    case 'slow':
      return ToastType.WARN
    case 'failing':
      return ToastType.ERROR
    default:
      return ToastType.INFO
  }
}

type ServiceStatus = 'normal' | 'slow' | 'failing'

const SLOW_RESPONSE_TIME_THRESHOLD = 200

function getMessage(serviceStatus: ServiceStatus) {
  switch (serviceStatus) {
    case 'slow':
      return 'Voting and creating proposals may take some time'
    case 'failing':
      return 'Voting and creating proposals is currently unavailable'
    default:
      return 'Let’s get governin’'
  }
}

function getStatusIcon(serviceStatus: ServiceStatus) {
  switch (serviceStatus) {
    case 'slow':
      return <SnapshotSlow />
    case 'failing':
      return <SnapshotFailing />
    default:
      return <SnapshotOk />
  }
}

function getTitle(serviceStatus: 'normal' | 'slow' | 'failing') {
  switch (serviceStatus) {
    case 'slow':
      return `Snapshot is ${serviceStatus}`
    case 'failing':
      return `Snapshot is ${serviceStatus}`
    default:
      return `Snapshot back to normal`
  }
}

export default function SnapshotPing() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>('normal')
  const [showToast, setShowToast] = useState(false)

  const updateServiceStatus = async () => {
    const responseTime = await pingSnapshot()
    if (responseTime === -1) {
      setServiceStatus('failing')
    } else if (responseTime > SLOW_RESPONSE_TIME_THRESHOLD) {
      setServiceStatus('slow')
    } else {
      setServiceStatus('normal')
    }
    setShowToast(true)
  }

  useEffect(() => {
    // const intervalId = setInterval(updateServiceStatus, PING_INTERVAL)
    // return () => clearInterval(intervalId)
    updateServiceStatus()
  }, [])

  return (
    <Toasts position="bottom right">
      {showToast && (
        <Toast
          title={
            <>
              {getStatusIcon(serviceStatus)}
              {getTitle(serviceStatus)}
            </>
          }
          className={`Toast--${getToastType(serviceStatus)}`}
          body={getMessage(serviceStatus)}
          onClose={() => setShowToast(false)}
        />
      )}
    </Toasts>
  )
}
