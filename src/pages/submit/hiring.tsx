import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { CommitteeName } from '../../clients/DclData'
import ProposalSubmitHiringPage from '../../components/Proposal/Submit/ProposalSubmitHiringPage'
import { getCommitteesWithOpenSlots } from '../../entities/Committee/utils'
import { HiringType, toHiringType } from '../../entities/Proposal/types'

import './submit.css'

export default function Hiring() {
  const location = useLocation()
  const param = new URLSearchParams(useMemo(() => new URLSearchParams(location.search), [location.search]))
  const request = param.get('request')

  const type = toHiringType(request, () => null)

  const [committees, committeesState] = useAsyncMemo(
    async () => {
      if (type === HiringType.Add) {
        const committees = await getCommitteesWithOpenSlots()
        return committees.map((committee) => committee.name)
      }

      return Object.values(CommitteeName)
    },
    [type],
    { initialValue: [] as CommitteeName[], callWithTruthyDeps: true }
  )

  if (type !== null) {
    return (
      <ProposalSubmitHiringPage type={type} committees={committees} isCommitteesLoading={committeesState.loading} />
    )
  }

  return <NotFound />
}
