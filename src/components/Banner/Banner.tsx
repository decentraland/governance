import { useCallback, useEffect, useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import Text from '../Common/Typography/Text'

import './Banner.css'

export type BannerProps = {
  isVisible: boolean
  title: string
  description: string
  bannerHideKey: string
  icon: React.ReactNode
  buttonLabel: string
  onButtonClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  buttonHref?: string
}

function Banner({
  isVisible,
  title,
  description,
  bannerHideKey,
  icon,
  buttonLabel,
  onButtonClick,
  buttonHref,
}: BannerProps) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  const handleClose = useCallback(
    (e: React.MouseEvent<unknown>) => {
      e.preventDefault()
      e.stopPropagation()
      localStorage.setItem(bannerHideKey, 'true')
      setShow(false)
    },
    [bannerHideKey]
  )

  return (
    <>
      {show && (
        <div className="Banner">
          <div className="Banner__Icon">{icon}</div>
          <div className="Banner__Content">
            <div className="Banner__Description">
              <Text weight="medium" size="lg">
                {title}
              </Text>
              <Text>{description}</Text>
            </div>
            <div className="Banner__ButtonContainer">
              <Button
                className="Banner__Button"
                primary
                size="small"
                onClick={onButtonClick}
                href={buttonHref}
                target="blank"
              >
                {buttonLabel}
              </Button>
            </div>
          </div>
          <Close small onClick={handleClose} />
        </div>
      )}
    </>
  )
}

export default Banner
