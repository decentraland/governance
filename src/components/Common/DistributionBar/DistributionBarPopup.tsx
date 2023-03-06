import React from 'react'

import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import './DistributionBarPopup.css'

export interface DistributionBarPopupContent {
  label: string
  content: React.ReactNode
  sub?: React.ReactNode
}

interface DistributionBarPopupProps {
  popupContent: DistributionBarPopupContent
  children: React.ReactNode
}

const DistributionBarPopup = ({ popupContent, children }: DistributionBarPopupProps) => {
  return (
    <Popup className="DistributionBarPopup" position="top center" trigger={children} on="hover">
      <Popup.Content>
        <div className="DistributionBarPopup">
          <div className="DistributionBarPopup__Label">{popupContent.label}</div>
          <div className="DistributionBarPopup__Content">{popupContent.content}</div>
          {popupContent.sub && <div className="DistributionBarPopup__Sub">{popupContent.sub}</div>}
        </div>
      </Popup.Content>
    </Popup>
  )
}

export default DistributionBarPopup
