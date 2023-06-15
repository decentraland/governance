import React, { useMemo } from 'react'

import { useLocation } from '@reach/router'
import { useQuery } from '@tanstack/react-query'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'

import { CommitteeName } from '../../clients/DclData'
import ProposalSubmitHiringPage from '../../components/Proposal/Submit/ProposalSubmitHiringPage'
import { getCommitteesWithOpenSlots } from '../../entities/Committee/utils'
import { HiringType, toHiringType } from '../../entities/Proposal/types'
import { DEFAULT_QUERY_STALE_TIME } from '../../hooks/constants'

import './submit.css'

export default function Hiring() {
  const location = useLocation()
  const param = new URLSearchParams(useMemo(() => new URLSearchParams(location.search), [location.search]))
  const request = param.get('request')

  const type = toHiringType(request, () => null)

  const { data: committees, isLoading: isCommitteesLoading } = useQuery({
    queryKey: [`committees#${type}`],
    queryFn: async () => {
      if (type === HiringType.Add) {
        const committees = await getCommitteesWithOpenSlots()
        return committees.map((committee) => committee.name)
      }

      return Object.values(CommitteeName)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  if (type !== null) {
    return (
      <ProposalSubmitHiringPage type={type} committees={committees ?? []} isCommitteesLoading={isCommitteesLoading} />
    )
  }

  return <NotFound />
}
