import useIsDiscordLinked from '../../hooks/useIsDiscordLinked'
import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'

import ConnectAccountsBanner, { shouldShowConnectAccountsBanner } from './ConnectAccountsBanner'
import DelegationBanner, { shouldShowDelegationBanner } from './DelegationBanner'
import SubscriptionBanner from './SubscriptionBanner'

interface Props {
  isVisible: boolean
}

const randomNumber = new Date().valueOf()

function RandomBanner({ isVisible }: Props) {
  const { showSubscriptionBanner } = useNewsletterSubscription()
  const { isLoadingIsDiscordLinked } = useIsDiscordLinked()

  if (!isVisible || isLoadingIsDiscordLinked) {
    return null
  }

  if (shouldShowConnectAccountsBanner()) {
    return <ConnectAccountsBanner />
  }

  const delegationBanner = <DelegationBanner />
  const subscriptionBanner = <SubscriptionBanner />
  if (!showSubscriptionBanner) {
    return delegationBanner
  }
  if (!shouldShowDelegationBanner()) {
    return subscriptionBanner
  }

  return randomNumber % 2 === 0 ? delegationBanner : subscriptionBanner
}

export default RandomBanner
