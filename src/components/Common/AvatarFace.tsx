import * as React from 'react'

import './AvatarFace.css'

export type AvatarFaceProps = {
  avatar?: string
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'responsive'
  inline?: boolean
  className?: string
}

export class AvatarFace extends React.PureComponent<AvatarFaceProps> {
  static defaultProps: Partial<AvatarFaceProps> = {
    size: 'medium',
  }

  render(): JSX.Element {
    const { avatar, size, inline, className } = this.props
    const classes = ['dcl', 'avatar-face', size, className]
    const face = <img src={avatar} alt="" />
    if (inline) {
      classes.push('inline')
    }

    return <div className={classes.join(' ')}>{face}</div>
  }
}
