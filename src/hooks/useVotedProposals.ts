import { useEffect, useState } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from './../clients/Governance'
import { VotedProposal } from './../entities/Votes/types'

const INITIAL_VALUE = [] as VotedProposal[]

function useVotedProposals(address: string, first?: number) {
  const [skip, setSkip] = useState(0)
  const [areMoreProposals, setAreMoreProposals] = useState(false)
  const [responseVotes, state] = useAsyncMemo(
    async () => {
      if (!isEthereumAddress(address)) {
        return INITIAL_VALUE
      }
      return await Governance.get().getAddressVotes(address, first, skip)
    },
    [address, first, skip],
    { initialValue: INITIAL_VALUE }
  )
  const [votes, setVotes] = useState(responseVotes)
  useEffect(() => {
    if (responseVotes.length > 0) {
      setVotes((prev) => [...prev, ...responseVotes])
    }
  }, [responseVotes])

  useEffect(() => {
    setAreMoreProposals(responseVotes.length === first)
  }, [responseVotes, first])

  const handleViewMore = () => setSkip((prev) => (first ? prev + first : prev))

  return { votes, isLoading: state.loading, handleViewMore, areMoreProposals }
}

export default useVotedProposals
