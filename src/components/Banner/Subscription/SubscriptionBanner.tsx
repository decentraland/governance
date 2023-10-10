import useFormatMessage from '../../../hooks/useFormatMessage'
import Email from '../../Icon/Email'
import Banner from '../Banner'

export const NEWSLETTER_SUBSCRIPTION_KEY = 'org.decentraland.governance.newsletter_subscription'
export const ANONYMOUS_USR_SUBSCRIPTION = 'anonymous_subscription'
export const HIDE_NEWSLETTER_SUBSCRIPTION_KEY = 'org.decentraland.governance.newsletter_subscription.hide'

type SubscriptionBannerProps = {
  isVisible: boolean
  onAction: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function SubscriptionBanner({ isVisible, onAction }: SubscriptionBannerProps) {
  const t = useFormatMessage()

  return (
    <Banner
      isVisible={isVisible}
      title={t(`page.subscription_banner.title`)}
      description={t(`page.subscription_banner.description`)}
      bannerHideKey={HIDE_NEWSLETTER_SUBSCRIPTION_KEY}
      icon={<Email />}
      buttonLabel={t(`page.subscription_banner.subscribe_button_label`)}
      onButtonClick={onAction}
    />
  )
}

export default SubscriptionBanner
