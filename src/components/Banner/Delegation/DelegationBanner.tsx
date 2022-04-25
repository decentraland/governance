import './DelegationBanner.css'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'

import useDelegationBanner from '../../../hooks/useDelegationBanner'
import Delegate from '../../Icon/Delegate'
import Banner from '../Banner'

type DelegationBannerProps = {
  isVisible: boolean
}

export const HIDE_DELEGATE_BANNER_KEY = 'org.decentraland.governance.delegate_banner.hide'

function DelegationBanner({ isVisible }: DelegationBannerProps) {
  const t = useFormatMessage()
  const showBanner = isVisible && useDelegationBanner()

  return (
    <div className="DelegationBanner__Container">
      <Banner
        isVisible={showBanner}
        title={t(`page.delegate_banner.title`)}
        description={t(`page.delegate_banner.description`)}
        bannerHideKey={HIDE_DELEGATE_BANNER_KEY}
        icon={<Delegate />}
        buttonLabel={t(`page.delegate_banner.button_label`)}
        buttonHref={process.env.GATSBY_DELEGATE_APPLICATION_URL}
      />
    </div>
  )
}

export default DelegationBanner
