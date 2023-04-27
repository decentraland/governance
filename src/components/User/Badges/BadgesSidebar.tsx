import React from 'react'

import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import { Badge } from '../../../entities/Badges/types'

import './BadgesSidebar.css'

const NO_IMAGE = require('../../../images/no-image.png').default

interface Props {
  isSidebarVisible: boolean
  onClose: () => void
  badges: Badge[]
}

export default function BadgesSidebar({ isSidebarVisible, onClose, badges }: Props) {
  function handleClose(e: React.MouseEvent<unknown>) {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  return (
    <Sidebar
      className="BadgesSidebar"
      animation={'push'}
      direction={'right'}
      visible={isSidebarVisible}
      width={'very wide'}
    >
      <div className="BadgesSidebar__Content">
        <div className="BadgesSidebar__TitleContainer">
          <span className="BadgesSidebar__Title">{'Your Badges'}</span>
          <Close onClick={handleClose} />
        </div>
        <div className="BadgesSidebar__BadgesContainer">
          {badges.map((badge) => {
            return (
              <div className="BadgeCard" key={`${badge.name}-id`}>
                <div className="BadgeCard__Icon">
                  <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} alt="badge-icon" />
                  <div className="BadgeCard__Info">
                    <div className="BadgeCard__Title">{badge.name}</div>
                    <div className="BadgeCard__MintDate">{`Minted ${Time.unix(badge.createdAt).fromNow()}`}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Sidebar>
  )
}
