import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

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
}

const ProposalsCreatedTab = ({ address }: Props) => {
  const [account] = useAuthContext()
  const t = useFormatMessage()

  const isLoggedUserAddress = isSameAddress(account, address || '')
  const user = isLoggedUserAddress ? account : address

  const { proposals, hasMoreProposals, loadMore, isLoadingProposals } = usePaginatedProposals({
    load: !!user,
    ...(!!user && { user: user?.toLowerCase() }),
  })

  const emptyDescriptionKey = isLoggedUserAddress
    ? 'page.profile.activity.my_proposals.empty'
    : 'page.profile.created_proposals.empty'

  return (
    <>
      {isLoadingProposals && <SkeletonBars amount={proposals.length || 5} height={89} />}
      {!isLoadingProposals && (
        <>
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <ProposalCreatedItem key={`${proposal.id}#${Math.random()}`} proposal={proposal} />
            ))
          ) : (
            <Empty className="ActivityBox__Empty" icon={<Watermelon />} description={t(emptyDescriptionKey)} />
          )}
        </>
      )}
      {!isLoadingProposals && hasMoreProposals && (
        <FullWidthButton onClick={loadMore}>{t('page.profile.activity.button')}</FullWidthButton>
      )}
    </>
  )
}

export default ProposalsCreatedTab
