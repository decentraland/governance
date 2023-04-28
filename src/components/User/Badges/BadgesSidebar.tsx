import React, { useState } from 'react'

import { Close } from 'decentraland-ui/dist/components/Close/Close'
import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import { Badge, UserBadges } from '../../../entities/Badges/types'
import ChevronLeft from '../../Icon/ChevronLeft'

import BadgeCard from './BadgeCard'
import BadgeDetail from './BadgeDetail'
import './BadgesSidebar.css'

const NO_IMAGE = require('../../../images/no-image.png').default

interface Props {
  isSidebarVisible: boolean
  onClose: () => void
  badges: UserBadges
}

export default function BadgesSidebar({ isSidebarVisible, onClose, badges }: Props) {
  const [badgeInDetail, setBadgeInDetail] = useState<Badge | null>(null)

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
      {!badgeInDetail && (
        <div className="BadgesSidebar__Content">
          <div className="BadgesSidebar__TitleContainer">
            <span className="BadgesSidebar__Title">{'Your Badges'}</span>
            <Close onClick={handleClose} />
          </div>

          <div className="BadgesSidebar__Subtitle">
            <span>{'Current Badges'}</span>
          </div>
          <div className="BadgesSidebar__BadgesContainer">
            {badges.currentBadges.map((badge) => {
              return <BadgeCard badge={badge} key={`${badge.name}-id`} onClick={() => setBadgeInDetail(badge)} />
            })}
          </div>
          <div className="BadgesSidebar__Subtitle">
            <span>{'Past Badges'}</span>
          </div>
          <div className="BadgesSidebar__BadgesContainer">
            {badges.expiredBadges.map((badge) => {
              return <BadgeCard badge={badge} key={`${badge.name}-id`} onClick={() => setBadgeInDetail(badge)} />
            })}
          </div>
        </div>
      )}
      {badgeInDetail && (
        <div className="BadgesSidebar__Content">
          <div className="BadgesSidebar__TitleContainer BadgeDetail__TitleContainer">
            <div className="BadgesSidebar__Sarlanga" onClick={() => setBadgeInDetail(null)}>
              <ChevronLeft />
              <span className="BadgesSidebar__Title">{'Badge detail'}</span>
            </div>
            <Close onClick={handleClose} />
          </div>
          <BadgeDetail badge={badgeInDetail} />
        </div>
      )}
    </Sidebar>
  )
}
