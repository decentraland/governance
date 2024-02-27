import { useAuthContext } from '../../front/context/AuthProvider'
import useFormatMessage from '../../hooks/useFormatMessage'

import { ProposalCreatedList } from './ProposalCreatedList'

const WatchlistTab = () => {
  const [account] = useAuthContext()
  const t = useFormatMessage()

  return (
    <ProposalCreatedList
      proposalsFilter={{
        load: !!account,
        ...(!!account && { subscribed: account }),
      }}
      emptyDescriptionText={t('page.profile.activity.watchlist.empty')}
    />
  )
}

export default WatchlistTab
