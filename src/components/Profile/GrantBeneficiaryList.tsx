import { useMemo } from 'react'

import { Project } from '../../entities/Proposal/types'
import { useSortingByKey } from '../../hooks/useSortingByKey'

import GrantBeneficiaryItem from './GrantBeneficiaryItem'

interface Props {
  grants: Project[]
}

const MAX_GRANTS = 4

function GrantBeneficiaryList({ grants }: Props) {
  const { sorted } = useSortingByKey(grants, 'enacted_at')
  const grantsToShow = useMemo(() => sorted.slice(0, MAX_GRANTS), [sorted])

  return (
    <>
      {grantsToShow.map((grant) => (
        <GrantBeneficiaryItem key={grant.id} grant={grant} />
      ))}
    </>
  )
}

export default GrantBeneficiaryList
