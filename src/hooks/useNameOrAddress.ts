import { useMemo } from 'react'

import useProfile from './useProfile'

export default function useNameOrAddress(address?: string | null) {
  const { profile, hasDclProfile } = useProfile(address)
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0
  return useMemo(() => (profile && profileHasName ? profile.name : address), [profileHasName])
}
