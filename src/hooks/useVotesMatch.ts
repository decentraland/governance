import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { calculateMatch } from '../entities/Snapshot/utils'

export default function useVotesMatch(userAccount: string | null, otherAccount: string | null) {
  const { data: userVotes, isLoading: userVotesLoading } = useQuery({
    queryKey: [`userVotes#${userAccount}`],
    queryFn: async () => {
      if (!userAccount) {
        return null
      }
      return SnapshotGraphql.get().getAddressesVotes([userAccount])
    },
    staleTime: 3.6e6, // 1 hour
  })

  const { data: otherAccountVotes, isLoading: otherAccountVotesLoading } = useQuery({
    queryKey: [`otherAccountVotes#${otherAccount}`],
    queryFn: async () => {
      if (!otherAccount) {
        return null
      }
      return Governance.get().getAddressVotes(otherAccount)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    userVotes,
    otherAccountVotes,
    matchResult: calculateMatch(userVotes ?? null, otherAccountVotes ?? null),
    votesInformationLoading: userVotesLoading || otherAccountVotesLoading,
  }
}
