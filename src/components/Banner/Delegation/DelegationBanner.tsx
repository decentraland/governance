import { OPEN_CALL_FOR_DELEGATES_LINK } from '../../../constants'
import { HIDE_DELEGATE_BANNER_KEY } from '../../../front/localStorageKeys'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Delegate from '../../Icon/Delegate'
import Banner from '../Banner'

import './DelegationBanner.css'

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
        title={t(`banner.delegate.title`)}
        description={t(`banner.delegate.description`)}
        bannerHideKey={HIDE_DELEGATE_BANNER_KEY}
        icon={<Delegate />}
        buttonLabel={t(`banner.delegate.button_label`)}
        buttonHref={OPEN_CALL_FOR_DELEGATES_LINK}
      />
    </div>
  )
}

export default DelegationBanner
