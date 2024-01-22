import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'

import './Banner.css'

type BannerColor = 'blue' | 'purple'

export type BannerProps = {
  isVisible: boolean
  title: string
  description: string
  bannerHideKey: string
  icon: React.ReactNode
  buttonLabel: string
  onButtonClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  buttonHref?: string
  color?: BannerColor
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
  color = 'blue',
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
        <div className={classNames('Banner', `Banner--${color}`)}>
          <div className="Banner__Icon">{icon}</div>
          <div className="Banner__Content">
            <div className="Banner__Description">
              <Text className="Banner__Text" weight="medium" size="lg">
                {title}
              </Text>
              <Text>{description}</Text>
            </div>
            <div className="Banner__ButtonContainer">
              <Button
                className={classNames('Banner__Button', `Banner__Button--${color}`)}
                primary
                size="small"
                onClick={onButtonClick}
                href={buttonHref}
                target={buttonHref ? '_blank' : undefined}
                as={buttonHref ? Link : undefined}
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
