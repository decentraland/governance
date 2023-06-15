import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { UserBadges } from '../entities/Badges/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

const NULL_USER_BADGES: UserBadges = { currentBadges: [], expiredBadges: [], total: 0 }

export default function useBadges(address?: string) {
  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: [`badges#${address}`],
    queryFn: () => {
      if (!address) return NULL_USER_BADGES
      return Governance.get().getBadges(address)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    badges: badges ?? NULL_USER_BADGES,
    isLoadingBadges,
  }
}
