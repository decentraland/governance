import { Close } from 'decentraland-ui/dist/components/Close/Close'

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
  setBadgeInDetail: React.Dispatch<React.SetStateAction<Badge | null>>
}

export default function BadgesSidebar({ isSidebarVisible, onClose, badges, badgeInDetail, setBadgeInDetail }: Props) {
  const t = useFormatMessage()
  const { currentBadges, expiredBadges } = badges

  const handleClose = (e: React.MouseEvent<unknown>) => {
    e.preventDefault()
    e.stopPropagation()
    setBadgeInDetail(null)
    onClose()
  }

  return (
    <GovernanceSidebar visible={isSidebarVisible}>
      {!badgeInDetail && (
        <div className="BadgesSidebar__Content">
          <div className="BadgesSidebar__TitleContainer">
            <span className="BadgesSidebar__Title">{t('page.profile.badges_sidebar.title')}</span>
            <Close onClick={handleClose} />
          </div>

          <div className="BadgesSidebar__Subtitle">
            <span>{t('page.profile.badges_sidebar.current', { amount: currentBadges.length })}</span>
          </div>
          <div className="BadgesSidebar__BadgesContainer">
            {currentBadges.map((badge, index) => {
              return <BadgeCard badge={badge} key={`${badge.name}-${index}`} onClick={() => setBadgeInDetail(badge)} />
            })}
          </div>
          {expiredBadges.length > 0 && (
            <>
              <div className="BadgesSidebar__Subtitle">
                <span>{t('page.profile.badges_sidebar.past', { amount: expiredBadges.length })}</span>
              </div>
              <div className="BadgesSidebar__BadgesContainer">
                {expiredBadges.map((badge, index) => {
                  return (
                    <BadgeCard badge={badge} key={`${badge.name}-${index}`} onClick={() => setBadgeInDetail(badge)} />
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
      {badgeInDetail && (
        <div className="BadgesSidebar__Content">
          <div className="BadgesSidebar__TitleContainer">
            <button className="BadgesSidebar__Back" onClick={() => setBadgeInDetail(null)}>
              <ChevronLeft />
              <span className="BadgesSidebar__Title">{t('page.profile.badges_sidebar.detail_title')}</span>
            </button>
            <Close onClick={handleClose} />
          </div>
          <BadgeDetail badge={badgeInDetail} />
        </div>
      )}
    </GovernanceSidebar>
  )
}
