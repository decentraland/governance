import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import Delegate from '../../Icon/Delegate'
import Banner from '../Banner'

import './DelegationBanner.css'

export const HIDE_DELEGATE_BANNER_KEY = 'org.decentraland.governance.delegate_banner.hide'

function DelegationBanner() {
  const t = useFormatMessage()

  return (
    <div className="DelegationBanner__Container">
      <Banner
        isVisible={localStorage.getItem(HIDE_DELEGATE_BANNER_KEY) !== 'true'}
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
