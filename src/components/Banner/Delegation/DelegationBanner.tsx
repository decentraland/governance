import './DelegationBanner.css'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import React, { useEffect } from 'react'

import Delegate from '../../Icon/Delegate'
import Banner, { BannerProps, BannerState, ShowBanner } from '../Banner'

type DelegationBannerProps = {
  bannerState: BannerState
  active?: boolean
}

const HIDE_DELEGATE_BANNER_KEY = 'org.decentraland.governance.delegate_banner.hide'

const button = (label: string) => {
  return (
    <Button
      className="Banner__Button"
      primary
      size="small"
      href="https://forum.decentraland.org/t/open-call-for-delegates-apply-now/5840"
    >
      {label}
    </Button>
  )
}

function DelegationBanner({ active, bannerState }: DelegationBannerProps) {
  const t = useFormatMessage()
  const { setShowBanner } = bannerState

  useEffect(() => {
    const showSubsBanner = localStorage.getItem(HIDE_DELEGATE_BANNER_KEY) != 'true'
    setShowBanner(showSubsBanner ? ShowBanner.YES : ShowBanner.NO)
  }, [])

  const bannerProps: BannerProps = {
    state: bannerState,
    title: t(`page.delegate_banner.title`),
    description: t(`page.delegate_banner.description`),
    active,
    bannerHideKey: HIDE_DELEGATE_BANNER_KEY,
    icon: <Delegate />,
    actionButton: button(t(`page.delegate_banner.button_label`)),
  }

  return (
    <div className="DelegationBanner__Container">
      <Banner {...bannerProps} />
    </div>
  )
}

export default DelegationBanner
