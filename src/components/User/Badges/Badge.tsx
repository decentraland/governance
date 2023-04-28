import React from 'react'

import { Badge as GovernanceBadge } from '../../../entities/Badges/types'
import HelperText from '../../Helper/HelperText'

import './Badge.css'

interface Props {
  badge: GovernanceBadge
}

const NO_IMAGE = require('../../../images/no-image.png').default

export default function Badge({ badge }: Props) {
  return (
    <div className="Badge" key={`${badge.name}-id`}>
      <div className="Badge__Icon">
        <img src={badge.image} onError={(e) => (e.currentTarget.src = NO_IMAGE)} alt="badge-icon" />
      </div>
      <div className="Badge__Title">
        <HelperText labelText={badge.name} tooltipText={badge.description} position="bottom center" />
      </div>
    </div>
  )
}
