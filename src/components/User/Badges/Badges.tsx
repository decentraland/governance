import React, { useState } from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import useBadges from '../../../hooks/useBadges'
import HelperText from '../../Helper/HelperText'

import './Badges.css'
import BadgesSidebar from './BadgesSidebar'

interface Props {
  address: string
}

const NO_IMAGE = require('../../../images/no-image.png').default

const MAX_DISPLAYED_BADGES = 3
export default function Badges({ address }: Props) {
  const { badges, isLoadingBadges } = useBadges(address)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayedBadges = badges?.currentBadges.slice(0, MAX_DISPLAYED_BADGES) ?? []
  const miniatureBadges = badges?.currentBadges.slice(MAX_DISPLAYED_BADGES) ?? badges?.expiredBadges ?? []

  return (
    <div className="Badges__Container">
      {!isLoadingBadges &&
        displayedBadges.map((badge) => {
          return (
            <div className="Badge" key={`${badge.name}-id`}>
              <div className="Badge__Icon">
                <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} alt="badge-icon" />
              </div>
              <div className="Badge__TitleContainer">
                {/* eslint-disable-next-line react/jsx-no-undef */}
                <HelperText labelText={badge.name} tooltipText={badge.description} position="bottom center" />
              </div>
            </div>
          )
        })}
      {!!miniatureBadges && (
        <div
          className="Badge__ShowMore"
          onClick={() => {
            setSidebarOpen(true)
          }}
        >
          {miniatureBadges.map((badge, index) => {
            return (
              <div
                className={TokenList.join([
                  'Badge__MiniIcon',
                  index === 0 && 'Badge__MiniIcon__Base',
                  index > 0 && 'Badge__MiniIcon__Overlapping',
                ])}
                key={`${badge.name}-id`}
                style={{ zIndex: index, left: `${index * -16}px` }}
              >
                <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} alt="badge-icon" />
              </div>
            )
          })}
          <span className="Badge__Counter" style={{ left: `${(miniatureBadges.length - 1) * -16}px` }}>
            {badges?.total - MAX_DISPLAYED_BADGES} MORE
          </span>
          <BadgesSidebar badges={badges} isSidebarVisible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}
    </div>
  )
}
