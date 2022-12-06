import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { CoauthorStatus } from '../../entities/Coauthor/types'
import usePaginatedProposals from '../../hooks/usePaginatedProposals'
import useProposalsByCoAuthor from '../../hooks/useProposalsByCoAuthor'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Watermelon from '../Icon/Watermelon'

import ProposalCreatedItem from './ProposalCreatedItem'

interface Props {
  address?: string
}

const CoAuthoringTab = ({ address }: Props) => {
  const [account] = useAuthContext()
  const t = useFormatMessage()

  const { proposals, hasMoreProposals, loadMore, isLoadingProposals } = usePaginatedProposals({
    load: !!account,
    ...((!!account || !!address) && { user: account || address }),
    coauthor: true,
  })

  const [pendingCoauthorRequests] = useProposalsByCoAuthor(account, CoauthorStatus.PENDING)

  return (
    <>
      {isLoadingProposals && <SkeletonBars amount={proposals.length || 5} height={89} />}
      {!isLoadingProposals && proposals.length > 0 ? (
        proposals.map((proposal) => (
          <ProposalCreatedItem
            key={proposal.id}
            proposal={proposal}
            showCoauthoring
            hasCoauthorRequests={!!pendingCoauthorRequests.find((req) => req.proposal_id === proposal.id)}
          />
        ))
      ) : (
        <Empty
          className="ProposalsCreatedBox__Empty"
          icon={<Watermelon />}
          description={
            address
              ? t('page.profile.activity.coauthoring.empty')
              : t('page.profile.activity.coauthoring.empty_logged_user')
          }
        />
      )}
      {hasMoreProposals && <FullWidthButton onClick={loadMore}>{t('page.profile.activity.button')}</FullWidthButton>}
    </>
  )
}

export default CoAuthoringTab
