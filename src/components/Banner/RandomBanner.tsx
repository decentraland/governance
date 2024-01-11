import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'

import DelegationBanner, { shouldShowDelegationBanner } from './DelegationBanner'
import LinkDiscordBanner, { shouldShowLinkDiscordBanner } from './LinkDiscordBanner'
import SubscriptionBanner from './SubscriptionBanner'

interface Props {
  isVisible: boolean
}

const randomNumber = new Date().valueOf()

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

  return randomNumber % 2 === 0 ? delegationBanner : subscriptionBanner
}

export default RandomBanner
