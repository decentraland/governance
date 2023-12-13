import classNames from 'classnames'

import './Avatar.css'
import { AvatarFace } from './AvatarFace'

export enum AvatarSize {
  Mini = 'mini',
  Tiny = 'tiny',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Big = 'big',
  Huge = 'huge',
  Massive = 'massive',
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

// TODO: avatar should be mandatory when no src is provided
export default function Avatar({ address, avatar, isLoadingDclProfile, size, src, className }: Props) {
  const avatarClassNames = classNames(
    'Avatar',
    `Avatar--${size || AvatarSize.Mini}`,
    `Avatar--${((address || '')[2] || '').toLowerCase()}`,
    isLoadingDclProfile && `Avatar--loading`,
    className
  )

  return src ? (
    <img src={src} className={avatarClassNames} />
  ) : (
    <AvatarFace avatar={avatar} className={avatarClassNames} />
  )
}
