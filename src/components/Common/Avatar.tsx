import React, { useState } from 'react'

import classNames from 'classnames'

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

const DEFAULT_AVATAR = 'https://decentraland.org/images/male.png'
type Props = {
  size?: `${AvatarSize}`
  src?: string
  address?: string
  loading?: boolean
}

type AvatarProps = Omit<
  React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
  'size' | 'src'
> &
  Props

export default function Avatar({ address, size, src, loading, ...props }: AvatarProps) {
  const [failed, setFailed] = useState(false)

  const { profile, isLoadingProfile } = useProfile(address)

  const getTarget = () => {
    const avatar = profile?.avatar?.snapshots?.face256 || profile?.avatar?.snapshots?.face
    if (src) {
      return src
    } else if (failed || !avatar) {
      return DEFAULT_AVATAR
    }

    return avatar
  }

  return (
    <img
      loading="lazy"
      {...props}
      src={!loading ? getTarget() : undefined}
      onError={() => setFailed(true)}
      width={props.width ?? '128'}
      height={props.height ?? '128'}
      className={classNames(
        'Avatar',
        `Avatar--${size || AvatarSize.Mini}`,
        `Avatar--${((address || '')[2] || '').toLowerCase()}`,
        (loading || (!src && isLoadingProfile)) && `Avatar--loading`,
        props.className
      )}
    />
  )
}
