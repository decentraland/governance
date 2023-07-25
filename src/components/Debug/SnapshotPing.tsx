import React, { useEffect, useState } from 'react'

import { Toast, ToastType, Toasts } from 'decentraland-ui'
import fetch from 'isomorphic-fetch'

import { getQueryTimestamp } from '../../clients/SnapshotGraphql'
import { SNAPSHOT_SPACE } from '../../entities/Snapshot/constants'
import Time from '../../utils/date/Time'

import './SnapshotPing.css'

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
    const responseTime = endTime - startTime
    return responseTime
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

function getMessage(serviceStatus: ServiceStatus) {
  switch (serviceStatus) {
    case 'slow':
      return 'Voting and creating proposals might take some time'
    case 'failing':
      return 'Voting and creating proposals is currently unavailable'
    default:
      return 'All good!'
  }
}

const SLOW_RESPONSE_TIME_THRESHOLD = 200

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
    <Toasts position="top right">
      {showToast && (
        <Toast
          title={`Snapshot is ${serviceStatus}`}
          className={`Toast--${getToastType(serviceStatus)}`}
          body={getMessage(serviceStatus)}
          closable
          onClose={() => setShowToast(false)}
        />
      )}
    </Toasts>
  )
}
