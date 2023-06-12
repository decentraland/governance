import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { UserBadges } from '../entities/Badges/types'

const NULL_USER_BADGES: UserBadges = { currentBadges: [], expiredBadges: [], total: 0 }

export default function useBadges(address?: string) {
  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: [`badges#${address}`],
    queryFn: () => {
      if (!address) return NULL_USER_BADGES
      return Governance.get().getBadges(address)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    badges,
    isLoadingBadges,
  }
}
