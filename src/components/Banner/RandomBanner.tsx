import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'
import usePushSubscriptions from '../../hooks/usePushSubscriptions'

import ConnectAccountsBanner, { shouldShowConnectAccountsBanner } from './ConnectAccountsBanner'
import DelegationBanner, { shouldShowDelegationBanner } from './DelegationBanner'
import SubscriptionBanner from './SubscriptionBanner'

interface Props {
  isVisible: boolean
}

const randomNumber = new Date().valueOf()

function RandomBanner({ isVisible }: Props) {
  const { showSubscriptionBanner } = useNewsletterSubscription()
  const [user] = useAuthContext()
  const { isProfileValidated, validationChecked } = useIsProfileValidated(user)

  const { isSubscribedToDaoChannel, isLoadingPushSubscriptions } = usePushSubscriptions()

  if (!isVisible || !validationChecked || isLoadingPushSubscriptions) {
    return null
  }

  if (shouldShowConnectAccountsBanner() && (!isProfileValidated || !isSubscribedToDaoChannel)) {
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
