import { useCallback } from 'react'

import { FeatureFlagOptions, fetchFlags } from '@dcl/feature-flags'
import { useQuery } from '@tanstack/react-query'

export default function useFeatureFlags(options = { applicationName: ['dao', 'dapps'] }) {
  const { data } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      const ff = await fetchFlags(options as FeatureFlagOptions)
      return ff
    },
    refetchOnWindowFocus: false,
  })

  const isFeatureFlagEnabled = useCallback(
    (value: string) => {
      return !!data?.flags && !!data?.flags[value]
    },
    [data]
  )

  return {
    data,
    isFeatureFlagEnabled,
  }
}
