import * as React from 'react'

import classNames from 'classnames'

import { DEFAULT_AVATAR_IMAGE } from '../../utils/Catalyst'

import './Avatar.css'

export enum AvatarSize {
  xxs = 'xxs',
  xs = 'xs',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
  xxl = 'xxl',
  Full = 'full',
}

type Props = {
  size?: `${AvatarSize}`
  address?: string
  className?: string
  src?: string
  avatar?: string
  isLoadingDclProfile?: boolean
}

export default function Avatar({ address, avatar, isLoadingDclProfile, size = AvatarSize.md, className }: Props) {
  const avatarClassNames = classNames(
    'Avatar',
    `Avatar--${size}`,
    address && `Avatar--${((address || '')[2] || '').toLowerCase()}`,
    isLoadingDclProfile && `Avatar--loading`,
    className
  )

  return <img src={avatar || DEFAULT_AVATAR_IMAGE} alt="" className={avatarClassNames} />
}
