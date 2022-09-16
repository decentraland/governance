import React, { useMemo } from 'react'

import useGrantsByUser from '../../../hooks/useGrantsByUser'

import ProfileGrantItem from './ProfileGrantItem'

interface Props {
  address: string
}

const MAX_GRANTS = 4

function ProfileGrantCard({ address }: Props) {
  const [grants, grantsState] = useGrantsByUser(address, true)
  const grantsToShow = useMemo(() => [...grants.current, ...grants.past].slice(0, MAX_GRANTS), [grants])

  return (
    <>
      {grantsToShow.map((grant) => (
        <ProfileGrantItem key={grant.id} grant={grant} />
      ))}
    </>
  )
}

export default ProfileGrantCard
