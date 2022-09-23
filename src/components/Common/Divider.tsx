import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './Divider.css'

interface Props {
  className?: string
  color?: string
  size?: 'small'
}

export default function Divider({ className, size, color = 'var(--black-300)' }: Props) {
  return (
    <div className={TokenList.join([size && `Divider__Container--${size}`, 'Divider__Container', className])}>
      <hr className="Divider" style={{ borderTopColor: color }} />
    </div>
  )
}
