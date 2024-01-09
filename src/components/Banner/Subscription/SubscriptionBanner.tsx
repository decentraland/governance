import useFormatMessage from '../../../hooks/useFormatMessage'
import useNewsletterSubscription from '../../../hooks/useNewsletterSubscription'
import Email from '../../Icon/Email'
import { NewsletterSubscriptionModal } from '../../Modal/NewsletterSubscriptionModal/NewsletterSubscriptionModal'
import Banner from '../Banner'

export const NEWSLETTER_SUBSCRIPTION_KEY = 'org.decentraland.governance.newsletter_subscription'
export const ANONYMOUS_USR_SUBSCRIPTION = 'anonymous_subscription'
export const HIDE_NEWSLETTER_SUBSCRIPTION_KEY = 'org.decentraland.governance.newsletter_subscription.hide'

function SubscriptionBanner() {
  const {
    showSubscriptionBanner,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    onSubscriptionSuccess,
    subscribed,
    onClose,
  } = useNewsletterSubscription()
  const t = useFormatMessage()

  return (
    <>
      <Banner
        isVisible={showSubscriptionBanner}
        title={t(`banner.subscription.title`)}
        description={t(`banner.subscription.description`)}
        bannerHideKey={HIDE_NEWSLETTER_SUBSCRIPTION_KEY}
        icon={<Email />}
        buttonLabel={t(`banner.subscription.subscribe_button_label`)}
        onButtonClick={() => setIsSubscriptionModalOpen(true)}
      />
      <NewsletterSubscriptionModal
        open={isSubscriptionModalOpen}
        onSubscriptionSuccess={onSubscriptionSuccess}
        subscribed={subscribed}
        onClose={onClose}
      />
    </>
  )
}

export default SubscriptionBanner
