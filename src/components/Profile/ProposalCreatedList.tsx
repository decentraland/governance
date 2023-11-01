import { CoauthorAttributes } from '../../entities/Coauthor/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useInfiniteProposals from '../../hooks/useInfiniteProposals'
import { UseProposalsFilter } from '../../hooks/useProposals'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Watermelon from '../Icon/Watermelon'

import ProposalCreatedItem from './ProposalCreatedItem'

interface Props {
  proposalsFilter: Partial<UseProposalsFilter>
  pendingCoauthorRequests?: CoauthorAttributes[]
  emptyDescriptionText: string
  showCoauthoring?: boolean
}

export function ProposalCreatedList({
  proposalsFilter,
  pendingCoauthorRequests,
  emptyDescriptionText,
  showCoauthoring = false,
}: Props) {
  const t = useFormatMessage()
  const { proposals, isLoadingProposals, isFetchingNextPage, isFetchingProposals, hasMoreProposals, loadMore } =
    useInfiniteProposals(proposalsFilter)
  const hasProposals = proposals && proposals?.[0]?.total > 0

  return (
    <>
      {isLoadingProposals && <SkeletonBars amount={3} height={89} />}
      {!isLoadingProposals && (
        <>
          {hasProposals ? (
            proposals.map((page) =>
              page.data.map((proposal) => (
                <ProposalCreatedItem
                  key={proposal.id}
                  proposal={proposal}
                  showCoauthoring={showCoauthoring}
                  hasCoauthorRequests={!!pendingCoauthorRequests?.find((req) => req.proposal_id === proposal.id)}
                />
              ))
            )
          ) : (
            <Empty className="ActivityBox__Empty" icon={<Watermelon />} description={emptyDescriptionText} />
          )}
          {hasMoreProposals && (
            <FullWidthButton loading={isFetchingNextPage || isFetchingProposals} onClick={loadMore}>
              {t('page.profile.activity.button')}
            </FullWidthButton>
          )}
        </>
      )}
    </>
  )
}
