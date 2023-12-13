import classNames from 'classnames'
import { AvatarFace } from 'decentraland-ui/dist/components/AvatarFace/AvatarFace'

import useProfile from '../../hooks/useProfile'

import './Avatar.css'

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
}

export default function Avatar({ address, size, src, className }: Props) {
  const { profile, isLoadingProfile } = useProfile(address, !!src)
  const avatarClassNames = classNames(
    'Avatar',
    `Avatar--${size || AvatarSize.Mini}`,
    `Avatar--${((address || '')[2] || '').toLowerCase()}`,
    isLoadingProfile && `Avatar--loading`,
    className
  )

  return src ? (
    <img src={src} className={avatarClassNames} />
  ) : (
    <AvatarFace avatar={profile} className={avatarClassNames} />
  )
}
