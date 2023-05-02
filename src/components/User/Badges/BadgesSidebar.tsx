import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import { Badge, UserBadges } from '../../../entities/Badges/types'
import ChevronLeft from '../../Icon/ChevronLeft'

import BadgeCard from './BadgeCard'
import BadgeDetail from './BadgeDetail'
import './BadgesSidebar.css'

interface Props {
  isSidebarVisible: boolean
  onClose: () => void
  badges: UserBadges
}

export default function BadgesSidebar({ isSidebarVisible, onClose, badges }: Props) {
  const t = useFormatMessage()
  const [badgeInDetail, setBadgeInDetail] = useState<Badge | null>(null)

  const handleClose = (e: React.MouseEvent<unknown>) => {
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
            <span className="BadgesSidebar__Title">{t('page.profile.badges_sidebar.title')}</span>
            <Close onClick={handleClose} />
          </div>

          <div className="BadgesSidebar__Subtitle">
            <span>{t('page.profile.badges_sidebar.current', { amount: badges.currentBadges.length })}</span>
          </div>
          <div className="BadgesSidebar__BadgesContainer">
            {badges.currentBadges.map((badge) => {
              return <BadgeCard badge={badge} key={`${badge.name}-id`} onClick={() => setBadgeInDetail(badge)} />
            })}
          </div>
          {badges.expiredBadges.length > 0 && (
            <>
              <div className="BadgesSidebar__Subtitle">
                <span>{t('page.profile.badges_sidebar.past', { amount: badges.expiredBadges.length })}</span>
              </div>
              <div className="BadgesSidebar__BadgesContainer">
                {badges.expiredBadges.map((badge) => {
                  return <BadgeCard badge={badge} key={`${badge.name}-id`} onClick={() => setBadgeInDetail(badge)} />
                })}
              </div>
            </>
          )}
        </div>
      )}
      {badgeInDetail && (
        <div className="BadgesSidebar__Content">
          <div className="BadgesSidebar__TitleContainer">
            <div className="BadgesSidebar__Back" onClick={() => setBadgeInDetail(null)}>
              <ChevronLeft />
              <span className="BadgesSidebar__Title">{t('page.profile.badges_sidebar.detail_title')}</span>
            </div>
            <Close onClick={handleClose} />
          </div>
          <BadgeDetail badge={badgeInDetail} />
        </div>
      )}
    </Sidebar>
  )
}
