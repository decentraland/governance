import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'

import DelegationBanner, { shouldShowDelegationBanner } from './Delegation/DelegationBanner'
import LinkDiscordBanner, { shouldShowLinkDiscordBanner } from './LinkDiscord/LinkDiscordBanner'
import SubscriptionBanner from './Subscription/SubscriptionBanner'

interface Props {
  isVisible: boolean
}

function RandomBanner({ isVisible }: Props) {
  const { showSubscriptionBanner } = useNewsletterSubscription()

  if (!isVisible) {
    return null
  }

  if (shouldShowLinkDiscordBanner()) {
    return <LinkDiscordBanner />
  }

  const delegationBanner = <DelegationBanner />
  const subscriptionBanner = <SubscriptionBanner />
  if (!showSubscriptionBanner) {
    return delegationBanner
  }
  if (!shouldShowDelegationBanner()) {
    return subscriptionBanner
  }

  return new Date().valueOf() % 2 === 0 ? delegationBanner : subscriptionBanner
}

export default RandomBanner
