import { useMemo, useState } from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import FullWidthButton from '../../Common/FullWidthButton'

import GrantCard from './GrantCard'

interface Props {
  proposals: ProposalAttributes[]
}

const MAX_PROPOSALS = 3

export default function GrantCardList({ proposals }: Props) {
  const t = useFormatMessage()
  const [limit, setLimit] = useState(MAX_PROPOSALS)
  const displayedProposals = useMemo(() => proposals.slice(0, limit), [limit, proposals])

  return (
    <>
      {displayedProposals.map((proposal) => (
        <GrantCard key={proposal.id} proposal={proposal} />
      ))}
      {proposals.length > limit && (
        <FullWidthButton onClick={() => setLimit(limit + MAX_PROPOSALS)}>
          {t('page.proposal_detail.author_details.sidebar.view_more_grants')}
        </FullWidthButton>
      )}
    </>
  )
}
