import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'
import { CoauthorAttributes, CoauthorStatus } from '../entities/Coauthor/types'

function useCoauthoring(user?: string | null, status?: CoauthorStatus) {
  return useAsyncMemo(
    () => {
      if (user) {
        return Governance.get().getProposalsByCoAuthor(user, status)
      }

      return Promise.resolve([] as CoauthorAttributes[])
    },
    [user],
    { initialValue: [] as CoauthorAttributes[], callWithTruthyDeps: true }
  )
}

export default useCoauthoring
