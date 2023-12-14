import * as React from 'react'

import classNames from 'classnames'

import './AvatarFace.css'

type AvatarFaceProps = {
  avatar: string
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'responsive'
  inline?: boolean
  className?: string
}

export function AvatarFace({ avatar, size = 'medium', inline, className }: AvatarFaceProps) {
  return (
    <div className={classNames('dcl', 'avatar-face', size, className, inline && 'inline')}>
      <img src={avatar} alt="" />
    </div>
  )
}
