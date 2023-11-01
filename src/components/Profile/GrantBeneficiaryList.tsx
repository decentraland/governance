import { useEffect, useMemo, useState } from 'react'

import { Project } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import { useSortingByKey } from '../../hooks/useSortingByKey'
import FullWidthButton from '../Common/FullWidthButton'

import GrantBeneficiaryItem from './GrantBeneficiaryItem'

interface Props {
  address: string | null
  grants: Project[]
}

const MAX_GRANTS = 3

function GrantBeneficiaryList({ grants, address }: Props) {
  const t = useFormatMessage()
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
        <FullWidthButton onClick={() => setLimit(() => limit + MAX_GRANTS)}>
          {t('page.profile.grants.button')}
        </FullWidthButton>
      )}
    </>
  )
}

export default GrantBeneficiaryList
