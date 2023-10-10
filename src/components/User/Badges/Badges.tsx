import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '../../../entities/Badges/types'
import useBadges from '../../../hooks/useBadges'
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
  const { badges, isLoadingBadges } = useBadges(address)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [badgeInDetail, setBadgeInDetail] = useState<Badge | null>(null)

  const displayedBadges = useMemo(() => badges.currentBadges.slice(0, MAX_DISPLAYED_BADGES) ?? [], [badges])
  const stackedBadges = useMemo(
    () => [...badges.currentBadges.slice(MAX_DISPLAYED_BADGES), ...badges.expiredBadges],
    [badges]
  )

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
    setBadgeInDetail(null)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const sidebar = document.querySelector('.GovernanceSidebar')
      const target = event.target as Node
      const isBadgeWithTitle = (target as Element).closest('.BadgeWithTitle')

      if (sidebar && !sidebar.contains(target) && !isBadgeWithTitle) {
        handleSidebarClose()
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen, handleSidebarClose])

  if (isLoadingBadges || badges?.total === 0) return null

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
        {!!stackedBadges && stackedBadges.length > 0 && (
          <BadgeStack
            badges={stackedBadges}
            total={stackedBadges.length}
            onClick={() => {
              setBadgeInDetail(null)
              setSidebarOpen(true)
            }}
          />
        )}
      </MobileSlider>
      <BadgesSidebar
        badges={badges}
        isSidebarVisible={sidebarOpen}
        badgeInDetail={badgeInDetail}
        setBadgeInDetail={setBadgeInDetail}
        onClose={handleSidebarClose}
      />
    </>
  )
}
