import { OPEN_CALL_FOR_DELEGATES_LINK } from '../../../constants'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Delegate from '../../Icon/Delegate'
import Banner from '../Banner'

import './DelegationBanner.css'

const HIDE_DELEGATE_BANNER_KEY = 'org.decentraland.governance.delegate_banner.hide'

export const shouldShowDelegationBanner = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(HIDE_DELEGATE_BANNER_KEY) !== 'true'
  }

  return false
}

function DelegationBanner() {
  const t = useFormatMessage()

  return (
    <div className="DelegationBanner__Container">
      <Banner
        isVisible={shouldShowDelegationBanner()}
        title={t(`page.delegate_banner.title`)}
        description={t(`page.delegate_banner.description`)}
        bannerHideKey={HIDE_DELEGATE_BANNER_KEY}
        icon={<Delegate />}
        buttonLabel={t(`page.delegate_banner.button_label`)}
        buttonHref={OPEN_CALL_FOR_DELEGATES_LINK}
      />
    </div>
  )
}

export default DelegationBanner
