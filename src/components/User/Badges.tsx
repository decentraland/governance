import React from 'react'
import Skeleton from 'react-loading-skeleton'

import useBadges from '../../hooks/useBadges'
import HelperText from '../Helper/HelperText'

import './Badges.css'

interface Props {
  address: string
}

const NO_IMAGE = require('../../images/no-image.png').default

export default function Badges({ address }: Props) {
  const { badges, isLoadingBadges } = useBadges(address)

  return (
    <div className="Badges__Container">
      {isLoadingBadges && <Skeleton className="Badge" />}
      {!isLoadingBadges &&
        badges.map((badge) => {
          return (
            <div className="Badge" key={`${badge.name}-id`}>
              <div className="Badge__Icon">
                <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} />
              </div>
              <div className="Badge__TitleContainer">
                <HelperText labelText={badge.name} tooltipText={badge.description} position="bottom center" />
                {badge.amount > 1 && <span className="Badge__Counter">x{badge.amount}</span>}
              </div>
            </div>
          )
        })}
    </div>
  )
}
