import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'
import { CoauthorAttributes, CoauthorStatus } from '../entities/Coauthor/types'

function useCoauthoring(coauthor?: string | null, status?: CoauthorStatus) {
  return useAsyncMemo(
    () => {
      if (coauthor) {
        return Governance.get().getProposalsByCoAuthor(coauthor, status)
      }

      return Promise.resolve([] as CoauthorAttributes[])
    },
    [coauthor, status],
    { initialValue: [] as CoauthorAttributes[] }
  )
}

export default useCoauthoring
