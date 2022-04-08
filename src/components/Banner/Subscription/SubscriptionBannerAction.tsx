import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import React from 'react'

type SubscriptionBannerActionProps = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

function SubscriptionBannerAction({ onClick }: SubscriptionBannerActionProps) {
  const t = useFormatMessage()

  return (
    <>
      <Button className="Banner__Button" primary size="small" onClick={onClick}>
        {t(`page.subscription_banner.subscribe_button_label`)}
      </Button>
    </>
  )
}

export default SubscriptionBannerAction
