import { useCallback, useMemo, useState } from 'react'

import { Badge } from '../../../entities/Badges/types'
import useBadges from '../../../hooks/useBadges'
import useFormatMessage from '../../../hooks/useFormatMessage'
import MobileSlider from '../../Common/MobileSlider'

import BadgeStack from './BadgeStack'
import BadgeWithTitle from './BadgeWithTitle'
import './Badges.css'
import BadgesSidebar from './BadgesSidebar'

interface Props {
  address: string
}

export const MAX_DISPLAYED_BADGES = 3

export default function Badges({ address }: Props) {
  const t = useFormatMessage()
  const { badges, isLoadingBadges } = useBadges(address)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [badgeInDetail, setBadgeInDetail] = useState<Badge | null>(null)

  const displayedBadges = useMemo(() => badges.currentBadges.slice(0, MAX_DISPLAYED_BADGES) ?? [], [badges])
  const stackedBadges = useMemo(
    () => [...badges.currentBadges.slice(MAX_DISPLAYED_BADGES), ...badges.expiredBadges],
    [badges]
  )

  const handleSidebarOpen = () => {
    setBadgeInDetail(null)
    setSidebarOpen(true)
  }

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  if (isLoadingBadges || badges?.total === 0) return null

  const hasDisplayedBadges = displayedBadges.length > 0
  const hasStackedBadges = !!stackedBadges && stackedBadges.length > 0

  return (
    <>
      <MobileSlider containerClassName="Badges__Container" className="Badges__Slider">
        {displayedBadges.map((badge, index) => {
          return (
            <BadgeWithTitle
              badge={badge}
              key={`${badge.name}-${index}`}
              onClick={() => {
                setSidebarOpen(true)
                setBadgeInDetail(badge)
              }}
            />
          )
        })}
        {hasDisplayedBadges && hasStackedBadges && (
          <BadgeStack badges={stackedBadges} total={stackedBadges.length} onClick={handleSidebarOpen} />
        )}
        {!hasDisplayedBadges && hasStackedBadges && (
          <button className="Badges__ViewPastBadges" onClick={handleSidebarOpen}>
            {t('page.profile.view_past_badges')}
          </button>
        )}
      </MobileSlider>
      <BadgesSidebar
        badges={badges}
        isSidebarVisible={sidebarOpen}
        badgeInDetail={badgeInDetail}
        onBadgeClick={(badge) => setBadgeInDetail(badge)}
        onClose={handleSidebarClose}
      />
    </>
  )
}
