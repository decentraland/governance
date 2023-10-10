import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { CoauthorAttributes } from '../../entities/Coauthor/types'
import { isSameAddress } from '../../entities/Snapshot/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePaginatedProposals from '../../hooks/usePaginatedProposals'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Watermelon from '../Icon/Watermelon'

import ProposalCreatedItem from './ProposalCreatedItem'

interface Props {
  address?: string
  pendingCoauthorRequests?: CoauthorAttributes[]
}

const CoAuthoringTab = ({ address, pendingCoauthorRequests }: Props) => {
  const [account] = useAuthContext()
  const t = useFormatMessage()

  const isLoggedUserProfile = isSameAddress(account, address || '')
  const user = isLoggedUserProfile ? account : address

  const { proposals, hasMoreProposals, loadMore, isLoadingProposals } = usePaginatedProposals({
    load: !!user,
    ...(!!user && { user: user?.toLowerCase() }),
    coauthor: true,
  })

  return (
    <>
      {isLoadingProposals && <SkeletonBars amount={proposals.length || 5} height={89} />}
      {!isLoadingProposals && (
        <>
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <ProposalCreatedItem
                key={proposal.id}
                proposal={proposal}
                showCoauthoring
                hasCoauthorRequests={!!pendingCoauthorRequests?.find((req) => req.proposal_id === proposal.id)}
              />
            ))
          ) : (
            <Empty
              className="ActivityBox__Empty"
              icon={<Watermelon />}
              description={
                isLoggedUserProfile
                  ? t('page.profile.activity.coauthoring.empty_logged_user')
                  : t('page.profile.activity.coauthoring.empty')
              }
            />
          )}
        </>
      )}
      {!isLoadingProposals && hasMoreProposals && (
        <FullWidthButton onClick={loadMore}>{t('page.profile.activity.button')}</FullWidthButton>
      )}
    </>
  )
}

export default CoAuthoringTab
