import './Banner.css'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import React, { useCallback } from 'react'

export enum ShowBanner {
  YES,
  NO,
}

export type BannerState = {
  showBanner: ShowBanner
  setShowBanner: React.Dispatch<React.SetStateAction<ShowBanner>>
}

export type BannerProps = {
  state: BannerState
  title: string
  description: string
  active?: boolean
  bannerHideKey: string
  icon: React.ReactNode
  actionButton: React.ReactElement
}

function Banner({ state, title, description, active, bannerHideKey, icon, actionButton }: BannerProps) {
  const { showBanner, setShowBanner } = state
  const handleClose = useCallback((e: React.MouseEvent<any>) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.setItem(bannerHideKey, 'true')
    setShowBanner(ShowBanner.NO)
  }, [])

  return (
    <>
      {showBanner == ShowBanner.YES && active && (
        <div className="Banner">
          <div className="Banner__Icon">{icon}</div>
          <div className="Banner__Content">
            <div className="Banner__Description">
              <Paragraph small semiBold>
                {title}
              </Paragraph>
              <Paragraph tiny>{description}</Paragraph>
            </div>
            <div className="Banner__ButtonContainer">{actionButton}</div>
          </div>
          <Close small onClick={handleClose} />
        </div>
      )}
    </>
  )
}

export default React.memo(Banner)
