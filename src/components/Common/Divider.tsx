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
    <hr
      className={TokenList.join(['Divider', size && `Divider--${size}`, className])}
      style={{ borderTopColor: color }}
    />
  )
}
