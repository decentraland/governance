import React, { useEffect, useRef } from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { Badge as GovernanceBadge } from '../../../entities/Badges/types'

import './Badge.css'

interface Props {
  badge: GovernanceBadge
  variant: BadgeVariant
}

export enum BadgeVariant {
  Primary = 'Primary',
  FilledMono = 'FilledMono',
  FilledDuo = 'FilledDuo',
  Outline1px = 'Outline-1px',
  Outline2px = 'Outline-2px',
}

const NO_IMAGE = require('../../../images/no-image.png').default

function getVariantClass(variant: BadgeVariant) {
  switch (variant) {
    case BadgeVariant.FilledMono:
      return 'Badge__FilledMono'
    case BadgeVariant.FilledDuo:
      return 'Badge__FilledDuo'
    case BadgeVariant.Outline1px:
      return 'Badge__Outline1px'
    case BadgeVariant.Outline2px:
      return 'Badge__Outline2px'
    default:
      return 'Badge__Primary'
  }
}

export default function Badge({ badge, variant = BadgeVariant.Primary }: Props) {
  const imgRef = useRef<any>()

  useEffect(() => {
    const img = new Image()
    img.src = badge.image
    img.onload = () => {
      imgRef.current.style.backgroundImage = `url(${badge.image})`
    }
    img.onerror = () => {
      imgRef.current.style.backgroundImage = `url(${NO_IMAGE})`
    }
  }, [badge.image])

  return (
    <div className="Badge">
      <div className={TokenList.join(['Badge__Icon', getVariantClass(variant)])} ref={imgRef} />
    </div>
  )
}
