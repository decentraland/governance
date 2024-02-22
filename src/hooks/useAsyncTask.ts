/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, useCallback, useEffect, useState } from 'react'

import { ErrorClient } from '../clients/ErrorClient'

import useAnalyticsTrack from './useAnalyticsTrack'

type AsyncTaskState<A extends unknown[] = []> = {
  loading: boolean
  args: A | null
}

export default function useAsyncTask<A extends unknown[] = []>(
  callback: (...args: A) => Promise<unknown>,
  deps: DependencyList
) {
  const [{ loading, args }, setLoading] = useState<AsyncTaskState<A>>({
    loading: false,
    args: null,
  })

  const track = useAnalyticsTrack()

  useEffect(() => {
    if (!loading) {
      return
    }

    if (args === null) {
      return
    }

    let cancelled = false
    Promise.resolve()
      .then(() => callback(...args))
      .then(() => {
        if (cancelled) {
          return
        }

        setLoading({ loading: false, args: null })
      })
      .catch((err) => {
        console.error(err)
        const errorObj = {
          ...err,
          message: err.message,
          stack: err.stack,
        }
        ErrorClient.report('AsyncTask error', errorObj)
        track('error', errorObj)
        if (cancelled) {
          return
        }

        setLoading({ loading: false, args: null })
      })

    return () => {
      cancelled = true
    }
  }, [loading])

  const callTask = useCallback(
    (...args: A) => {
      setLoading({ loading: true, args })
    },
    [loading, args, ...deps]
  )

  return [loading, callTask] as const
}
