import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import './DistributionBarPopup.css'

export interface DistributionBarPopupContent {
  title: string
  content: React.ReactNode
  sub?: React.ReactNode
}

interface DistributionBarPopupProps {
  popupContent: DistributionBarPopupContent
  open?: boolean
  children: React.ReactNode
}

const DistributionBarPopup = ({ popupContent, open, children }: DistributionBarPopupProps) => {
  const t = useFormatMessage()
  return (
    <Popup
      className="DistributionBarPopup"
      position="top center"
      trigger={children}
      on="hover"
      open={open}
      hideOnScroll={true}
    >
      <Popup.Content>
        <div className="DistributionBarPopup">
          <div className="DistributionBarPopup__Title">{t(popupContent.title)}</div>
          <div className="DistributionBarPopup__Content">{popupContent.content}</div>
          {popupContent.sub && <div className="DistributionBarPopup__Sub">{popupContent.sub}</div>}
        </div>
      </Popup.Content>
    </Popup>
  )
}

export default DistributionBarPopup