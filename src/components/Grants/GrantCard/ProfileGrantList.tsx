import React, { useMemo } from 'react'

import { GrantAttributes } from '../../../entities/Proposal/types'
import { useSortingByKey } from '../../../hooks/useSortingByKey'

import ProfileGrantItem from './ProfileGrantItem'

interface Props {
  grants: GrantAttributes[]
}

const MAX_GRANTS = 4

function ProfileGrantList({ grants }: Props) {
  const { sorted } = useSortingByKey(grants, 'enacted_at')
  const grantsToShow = useMemo(() => sorted.slice(0, MAX_GRANTS), [sorted])

  return (
    <>
      {grantsToShow.map((grant) => (
        <ProfileGrantItem key={grant.id} grant={grant} />
      ))}
    </>
  )
}

export default ProfileGrantList
