import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useVotedProposals(address: string, first?: number) {
  const [skip, setSkip] = useState(0)

  const { data: responseVotes, isLoading } = useQuery({
    queryKey: [`votedProposals#${address}#${first}#${skip}`],
    queryFn: async () => {
      if (!isEthereumAddress(address)) {
        return []
      }
      return await Governance.get().getVotesAndProposalsByAddress(address, first, skip)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const [votes, setVotes] = useState(responseVotes ?? [])
  useEffect(() => {
    if (responseVotes && responseVotes.length > 0) {
      setVotes((prev) => [...prev, ...responseVotes])
    }
  }, [responseVotes])

  const handleViewMore = () => setSkip((prev) => (first ? prev + first : prev))

  return {
    votes,
    isLoading,
    handleViewMore,
    hasMoreProposals: responseVotes?.length === first,
  }
}

export default useVotedProposals
