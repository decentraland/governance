import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from './../clients/Governance'

function useVotedProposals(address: string, first?: number) {
  const [skip, setSkip] = useState(0)

  const { data: responseVotes, isLoading } = useQuery({
    queryKey: [`votedProposals#${address}#${first}`],
    queryFn: async () => {
      if (!isEthereumAddress(address)) {
        return []
      }
      return await Governance.get().getAddressVotes(address, first, skip)
    },
    staleTime: 3.6e6, // 1 hour
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
