import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { BadgeStatus, Badge as GovernanceBadge } from '../../../entities/Badges/types'

import './Badge.css'

interface Props {
  badge: GovernanceBadge
  className?: string
  iconClassName?: string
  variant?: BadgeVariant
}

export enum BadgeVariant {
  Primary = 'Primary',
  FilledMono = 'FilledMono',
  FilledMonoSmall = 'FilledMonoSmall',
  FilledDuo = 'FilledDuo',
  Outline1px = 'Outline-1px',
  Outline2px = 'Outline-2px',
}

function getVariantClass(variant: BadgeVariant) {
  switch (variant) {
    case BadgeVariant.FilledMono:
      return 'Badge__Icon--filled-mono'
    case BadgeVariant.FilledMonoSmall:
      return 'Badge__Icon--filled-mono-small'
    case BadgeVariant.FilledDuo:
      return 'Badge__Icon--filled-duo'
    case BadgeVariant.Outline1px:
      return 'Badge__Icon--outline-1px'
    case BadgeVariant.Outline2px:
      return 'Badge__Icon--outline-2px'
    default:
      return 'Badge__Icon--primary'
  }
}

export default function Badge({ badge, className, iconClassName, variant = BadgeVariant.Primary }: Props) {
  const isRevoked = badge.status === BadgeStatus.Revoked

  return (
    <div className={TokenList.join(['Badge', className])}>
      <div
        className={TokenList.join([
          'Badge__Icon',
          getVariantClass(variant),
          isRevoked && 'Badge__Icon--revoked',
          iconClassName,
        ])}
        style={{ backgroundImage: `url(${badge.image})` }}
      />
    </div>
  )
}
