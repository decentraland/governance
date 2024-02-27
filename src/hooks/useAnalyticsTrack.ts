import { useCallback } from 'react'

import { useAuthContext } from '../front/context/AuthProvider'
import { track } from '../utils/analytics'

import useFeatureFlags from './useDclFeatureFlags'

export default function useAnalyticsTrack() {
  const [ethAddress] = useAuthContext()
  const { data: featureFlags } = useFeatureFlags()

  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: string, data?: Record<string, any>): void =>
      track(event, {
        ...data,
        ethAddress,
        featureFlags: featureFlags?.flags,
      }),
    [ethAddress, featureFlags]
  )
}
