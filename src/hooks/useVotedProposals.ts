import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from './../clients/Governance'
import { VotedProposal } from './../entities/Votes/types'

const INITIAL_VALUE = [] as VotedProposal[]

function useVotedProposals(address: string, first?: number, skip?: number) {
  const [votes, state] = useAsyncMemo(
    async () => {
      if (!isEthereumAddress(address)) {
        return INITIAL_VALUE
      }
      return await Governance.get().getAddressVotes(address, first, skip)
    },
    [address, first, skip],
    { initialValue: INITIAL_VALUE }
  )

  return { votes, isLoading: state.loading }
}

export default useVotedProposals
