import { Badge, UserBadges } from '../../../entities/Badges/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import ChevronLeft from '../../Icon/ChevronLeft'
import GovernanceSidebar from '../../Sidebar/GovernanceSidebar'

import BadgeCard from './BadgeCard'
import BadgeDetail from './BadgeDetail'
import './BadgesSidebar.css'

interface Props {
  isSidebarVisible: boolean
  onClose: () => void
  badges: UserBadges
  badgeInDetail: Badge | null
  onBadgeClick: (badge: Badge | null) => void
}

export default function BadgesSidebar({ isSidebarVisible, onClose, badges, badgeInDetail, onBadgeClick }: Props) {
  const t = useFormatMessage()
  const { currentBadges, expiredBadges } = badges

  const title = !badgeInDetail ? (
    t('page.profile.badges_sidebar.title')
  ) : (
    <button className="BadgesSidebar__Back" onClick={() => onBadgeClick(null)}>
      <ChevronLeft />
      <span className="BadgesSidebar__Title">{t('page.profile.badges_sidebar.detail_title')}</span>
    </button>
  )

  return (
    <GovernanceSidebar title={title} visible={isSidebarVisible} onClose={onClose}>
      {!badgeInDetail && (
        <div className="BadgesSidebar__Content">
          <div className="BadgesSidebar__Subtitle">
            <span>{t('page.profile.badges_sidebar.current', { amount: currentBadges.length })}</span>
          </div>
          <div className="BadgesSidebar__BadgesContainer">
            {currentBadges.map((badge, index) => {
              return <BadgeCard badge={badge} key={`${badge.name}-${index}`} onClick={onBadgeClick} />
            })}
          </div>
          {expiredBadges.length > 0 && (
            <>
              <div className="BadgesSidebar__Subtitle">
                <span>{t('page.profile.badges_sidebar.past', { amount: expiredBadges.length })}</span>
              </div>
              <div className="BadgesSidebar__BadgesContainer">
                {expiredBadges.map((badge, index) => {
                  return <BadgeCard badge={badge} key={`${badge.name}-${index}`} onClick={onBadgeClick} />
                })}
              </div>
            </>
          )}
        </div>
      )}
      {badgeInDetail && (
        <div className="BadgesSidebar__Content">
          <BadgeDetail badge={badgeInDetail} />
        </div>
      )}
    </GovernanceSidebar>
  )
}
