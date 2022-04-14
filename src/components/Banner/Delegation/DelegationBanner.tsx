import './DelegationBanner.css'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React, { useEffect, useState } from 'react'

import Delegate from '../../Icon/Delegate'
import Banner from '../Banner'

type DelegationBannerProps = {
  isVisible: boolean
}

const HIDE_DELEGATE_BANNER_KEY = 'org.decentraland.governance.delegate_banner.hide'

function DelegationBanner({ isVisible }: DelegationBannerProps) {
  const t = useFormatMessage()
  const [hasHideBannerKey, setHasHideBannerKey] = useState(true)

  useEffect(() => {
    setHasHideBannerKey(localStorage.getItem(HIDE_DELEGATE_BANNER_KEY) === 'true')
  }, [])

  return (
    <div className="DelegationBanner__Container">
      <Banner
        isVisible={!hasHideBannerKey && isVisible}
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
