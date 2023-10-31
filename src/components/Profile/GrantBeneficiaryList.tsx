import { useEffect, useMemo, useState } from 'react'

import { Project } from '../../entities/Proposal/types'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import FullWidthButton from '../Common/FullWidthButton'

import GrantBeneficiaryItem from './GrantBeneficiaryItem'

interface Props {
  address: string | null
  grants: Project[]
}

const MAX_GRANTS = 4

function GrantBeneficiaryList({ grants, address }: Props) {
  const { sorted } = useSortingByKey(grants, 'enacted_at')
  const [limit, setLimit] = useState(MAX_GRANTS)
  const grantsToShow = useMemo(() => sorted.slice(0, limit), [sorted, limit])

  useEffect(() => setLimit(MAX_GRANTS), [address])

  return (
    <>
      {grantsToShow.map((grant) => (
        <GrantBeneficiaryItem key={grant.id} grant={grant} />
      ))}
      {sorted.length > limit && (
        <FullWidthButton onClick={() => setLimit(() => limit + MAX_GRANTS)}>Load more proposals</FullWidthButton>
      )}
    </>
  )
}

export default GrantBeneficiaryList
