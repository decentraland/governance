import { HIDE_NEWSLETTER_SUBSCRIPTION_KEY } from '../../../front/localStorageKeys'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useNewsletterSubscription from '../../../hooks/useNewsletterSubscription'
import Email from '../../Icon/Email'
import { NewsletterSubscriptionModal } from '../../Modal/NewsletterSubscriptionModal/NewsletterSubscriptionModal'
import Banner from '../Banner'

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
