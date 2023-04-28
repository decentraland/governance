import React, { useState } from 'react'

import useBadges from '../../../hooks/useBadges'

import Badge from './Badge'
import BadgeStack from './BadgeStack'
import './Badges.css'
import BadgesSidebar from './BadgesSidebar'

interface Props {
  address: string
}

export const MAX_DISPLAYED_BADGES = 3

export default function Badges({ address }: Props) {
  const { badges, isLoadingBadges } = useBadges(address)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const displayedBadges = badges?.currentBadges.slice(0, MAX_DISPLAYED_BADGES) ?? []
  const miniatureBadges = badges?.currentBadges.slice(MAX_DISPLAYED_BADGES) ?? badges?.expiredBadges ?? []

  if (isLoadingBadges || badges?.total === 0) return null

  return (
    <div className="Badges__Container">
      {displayedBadges.map((badge) => {
        return <Badge badge={badge} key={`${badge.name}-id`} />
      })}
      {!!miniatureBadges && (
        <BadgeStack
          badges={miniatureBadges}
          total={badges.total}
          onClick={() => {
            setSidebarOpen(true)
          }}
        />
      )}
      <BadgesSidebar badges={badges} isSidebarVisible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}
